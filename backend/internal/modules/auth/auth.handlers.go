package auth

import "github.com/gofiber/fiber/v2"

func testAuth(ctx *fiber.Ctx) error {
	ctx.Send([]byte("Hello World!"))
	return nil
}
