package auth

import (
	"errors"
	"strconv"
	"strings"
	"time"

	"resy/backend/internal/config"
	"resy/backend/internal/db"
	"resy/backend/internal/modules/user"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type registerRequest struct {
	Name     string `json:"name"`
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type authResponse struct {
	Token string       `json:"token"`
	User  userResponse `json:"user"`
}

type availabilityResponse struct {
	EmailAvailable    *bool `json:"emailAvailable,omitempty"`
	UsernameAvailable *bool `json:"usernameAvailable,omitempty"`
}

type userResponse struct {
	ID        uint   `json:"id"`
	Name      string `json:"name"`
	Username  string `json:"username"`
	Email     string `json:"email"`
	CreatedAt string `json:"createdAt"`
}

type claims struct {
	UserID uint `json:"userId"`
	jwt.RegisteredClaims
}

func registerHandler(cfg config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var body registerRequest
		if err := c.BodyParser(&body); err != nil {
			return fiber.NewError(fiber.StatusBadRequest, "invalid request body")
		}

		body.Name = strings.TrimSpace(body.Name)
		body.Username = strings.ToLower(strings.TrimSpace(body.Username))
		body.Email = strings.ToLower(strings.TrimSpace(body.Email))

		if body.Name == "" || body.Username == "" || body.Email == "" || body.Password == "" {
			return fiber.NewError(fiber.StatusBadRequest, "name, username, email and password are required")
		}
		if len(body.Password) < 8 {
			return fiber.NewError(fiber.StatusBadRequest, "password must be at least 8 characters")
		}

		database := db.GetDB()
		var existing user.User
		err := database.Where("email = ? OR username = ?", body.Email, body.Username).First(&existing).Error
		if err == nil {
			return fiber.NewError(fiber.StatusConflict, "email or username already exists")
		}
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(body.Password), bcrypt.DefaultCost)
		if err != nil {
			return err
		}

		newUser := user.User{
			Name:     body.Name,
			Username: body.Username,
			Email:    body.Email,
			Password: string(hashedPassword),
		}

		if err := database.Create(&newUser).Error; err != nil {
			return err
		}

		token, err := createToken(cfg, newUser.ID)
		if err != nil {
			return err
		}

		return c.Status(fiber.StatusCreated).JSON(authResponse{
			Token: token,
			User:  toUserResponse(newUser),
		})
	}
}

func availabilityHandler(c *fiber.Ctx) error {
	email := strings.ToLower(strings.TrimSpace(c.Query("email")))
	username := strings.ToLower(strings.TrimSpace(c.Query("username")))

	if email == "" && username == "" {
		return fiber.NewError(fiber.StatusBadRequest, "email or username is required")
	}

	response := availabilityResponse{}
	database := db.GetDB()

	if email != "" {
		var count int64
		if err := database.Model(&user.User{}).Where("email = ?", email).Count(&count).Error; err != nil {
			return err
		}

		available := count == 0
		response.EmailAvailable = &available
	}

	if username != "" {
		var count int64
		if err := database.Model(&user.User{}).Where("username = ?", username).Count(&count).Error; err != nil {
			return err
		}

		available := count == 0
		response.UsernameAvailable = &available
	}

	return c.JSON(response)
}

func loginHandler(cfg config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var body loginRequest
		if err := c.BodyParser(&body); err != nil {
			return fiber.NewError(fiber.StatusBadRequest, "invalid request body")
		}

		body.Email = strings.ToLower(strings.TrimSpace(body.Email))
		if body.Email == "" || body.Password == "" {
			return fiber.NewError(fiber.StatusBadRequest, "email and password are required")
		}

		var foundUser user.User
		err := db.GetDB().Where("email = ?", body.Email).First(&foundUser).Error
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusUnauthorized, "invalid email or password")
		}
		if err != nil {
			return err
		}

		if err := bcrypt.CompareHashAndPassword([]byte(foundUser.Password), []byte(body.Password)); err != nil {
			return fiber.NewError(fiber.StatusUnauthorized, "invalid email or password")
		}

		if err := db.GetDB().Model(&foundUser).Update("last_login", time.Now()).Error; err != nil {
			return err
		}

		token, err := createToken(cfg, foundUser.ID)
		if err != nil {
			return err
		}

		return c.JSON(authResponse{
			Token: token,
			User:  toUserResponse(foundUser),
		})
	}
}

func meHandler(c *fiber.Ctx) error {
	currentUser, ok := c.Locals("user").(user.User)
	if !ok {
		return fiber.NewError(fiber.StatusUnauthorized, "unauthorized")
	}

	return c.JSON(toUserResponse(currentUser))
}

func requireAuth(cfg config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return fiber.NewError(fiber.StatusUnauthorized, "missing authorization header")
		}

		tokenString, ok := strings.CutPrefix(authHeader, "Bearer ")
		if !ok || strings.TrimSpace(tokenString) == "" {
			return fiber.NewError(fiber.StatusUnauthorized, "invalid authorization header")
		}

		token, err := jwt.ParseWithClaims(strings.TrimSpace(tokenString), &claims{}, func(token *jwt.Token) (any, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fiber.NewError(fiber.StatusUnauthorized, "invalid token")
			}

			return []byte(cfg.JWTSecret), nil
		})
		if err != nil || !token.Valid {
			return fiber.NewError(fiber.StatusUnauthorized, "invalid token")
		}

		parsedClaims, ok := token.Claims.(*claims)
		if !ok || parsedClaims.UserID == 0 {
			return fiber.NewError(fiber.StatusUnauthorized, "invalid token")
		}

		var currentUser user.User
		err = db.GetDB().First(&currentUser, parsedClaims.UserID).Error
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusUnauthorized, "user not found")
		}
		if err != nil {
			return err
		}

		c.Locals("user", currentUser)
		return c.Next()
	}
}

func createToken(cfg config.Config, userID uint) (string, error) {
	expiresIn, err := time.ParseDuration(cfg.JWTExpiresIn)
	if err != nil {
		expiresIn = 24 * time.Hour
	}

	now := time.Now()
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   strconv.FormatUint(uint64(userID), 10),
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(expiresIn)),
		},
	})

	return token.SignedString([]byte(cfg.JWTSecret))
}

func toUserResponse(account user.User) userResponse {
	return userResponse{
		ID:        account.ID,
		Name:      account.Name,
		Username:  account.Username,
		Email:     account.Email,
		CreatedAt: account.CreatedAt.UTC().Format(time.RFC3339),
	}
}
