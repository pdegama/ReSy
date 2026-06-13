package handlers

import (
	"resy/backend/internal/modules/auth"

	"github.com/gofiber/fiber/v2"
)

func RegisterAppRoutes(router fiber.Router) {
	auth.RegisterUserRouts(router)
}
