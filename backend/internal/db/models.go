package db

import (
	"fmt"
	"resy/backend/internal/modules/user"
)

func SyncDB() {
	err := db.AutoMigrate(
		&user.User{},
	)
	if err != nil {
		fmt.Println("Error white auto migrate tables")
		panic(err)
	}
}
