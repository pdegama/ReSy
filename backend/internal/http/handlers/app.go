package handlers

import (
	"resy/backend/internal/config"
	"resy/backend/internal/modules/auth"

	"github.com/gofiber/fiber/v2"
)

func RegisterAppRoutes(router fiber.Router, cfg config.Config) {
	auth.RegisterUserRouts(router, cfg)
}
