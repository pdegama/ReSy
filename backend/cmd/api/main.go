package main

import (
	"log"

	"resy/backend/internal/config"
	"resy/backend/internal/db"
	"resy/backend/internal/http"
)

func main() {
	cfg := config.Load()

	// connect wirh db
	db.ConnectWithDB(cfg)
	db.SyncDB()

	app := http.NewServer(cfg)

	if err := app.Listen(":" + cfg.Port); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}
