package auth

import "github.com/gofiber/fiber/v2"

func RegisterUserRouts(router fiber.Router) {
	auth := router.Group("/auth")
	auth.Get("/", testAuth)
}
