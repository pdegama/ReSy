package config

import (
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	AppName      string
	Environment  string
	Port         string
	CORSOrigins  []string
	DatabaseURL  string
	JWTSecret    string
	JWTExpiresIn string
}

func Load() Config {
	_ = godotenv.Load()

	return Config{
		AppName:      getEnv("APP_NAME", "ReSy API"),
		Environment:  getEnv("APP_ENV", "development"),
		Port:         getEnv("APP_PORT", "8080"),
		CORSOrigins:  splitEnv("CORS_ORIGINS", "http://localhost:5173"),
		DatabaseURL:  getEnv("DATABASE_URL", ""),
		JWTSecret:    getEnv("JWT_SECRET", "change-me-dev-secret"),
		JWTExpiresIn: getEnv("JWT_EXPIRES_IN", "24h"),
	}
}

func getEnv(key string, fallback string) string {
	if value := strings.TrimSpace(os.Getenv(key)); value != "" {
		return value
	}

	return fallback
}

func splitEnv(key string, fallback string) []string {
	raw := getEnv(key, fallback)
	parts := strings.Split(raw, ",")
	values := make([]string, 0, len(parts))

	for _, part := range parts {
		value := strings.TrimSpace(part)
		if value != "" {
			values = append(values, value)
		}
	}

	return values
}
