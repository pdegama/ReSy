FROM golang:1.23-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /out/resy-api ./cmd/api

FROM alpine:3.20

RUN addgroup -S app && adduser -S app -G app && apk add --no-cache ca-certificates wget

WORKDIR /app

COPY --from=builder /out/resy-api /app/resy-api

USER app

EXPOSE 8080

CMD ["/app/resy-api"]
