package auth

import (
	"resy/backend/internal/config"

	"github.com/gofiber/fiber/v2"
)

func RegisterUserRouts(router fiber.Router, cfg config.Config) {
	auth := router.Group("/auth")
	auth.Get("/availability", availabilityHandler)
	auth.Post("/register", registerHandler(cfg))
	auth.Post("/login", loginHandler(cfg))
	auth.Get("/me", requireAuth(cfg), meHandler)
}
