package user

import (
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Name      string
	Username  string
	Password  string
	LastLogin datatypes.Date
}
