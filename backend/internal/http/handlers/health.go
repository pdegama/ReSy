package handlers

import (
	"time"

	"resy/backend/internal/config"

	"github.com/gofiber/fiber/v2"
)

func RegisterHealthRoutes(router fiber.Router, cfg config.Config) {
	router.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":      "ok",
			"service":     cfg.AppName,
			"environment": cfg.Environment,
			"timestamp":   time.Now().UTC().Format(time.RFC3339),
		})
	})
}
