package middleware

import "github.com/gofiber/fiber/v2"

type errorResponse struct {
	Message string `json:"message"`
	Status  int    `json:"status"`
}

func ErrorHandler(c *fiber.Ctx, err error) error {
	code := fiber.StatusInternalServerError
	message := "internal server error"

	if fiberErr, ok := err.(*fiber.Error); ok {
		code = fiberErr.Code
		message = fiberErr.Message
	}

	return c.Status(code).JSON(errorResponse{
		Message: message,
		Status:  code,
	})
}

