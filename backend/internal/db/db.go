package db

import (
	"fmt"

	"resy/backend/internal/config"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var db *gorm.DB = nil

func ConnectWithDB(conf config.Config) {
	_db, err := gorm.Open(postgres.Open(conf.DatabaseURL), &gorm.Config{})
	if err != nil {
		fmt.Println("Error while connection with database")
		panic(err)
	}
	db = _db
}

func GetDB() *gorm.DB {
	if db == nil {
		panic("database is not connected")
	}

	return db
}
