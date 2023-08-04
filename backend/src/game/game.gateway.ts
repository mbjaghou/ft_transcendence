import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage } from "@nestjs/websockets";
import { Socket, Server } from "socket.io";
import { GameService } from "./game.service";
import { GameDto } from "../game/game.dto";
import { AuthService } from "../auth/auth.service";
@WebSocketGateway({ cors: { origin: '*' }, namespace: "game" })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(
        private gameService: GameService,
        private authService: AuthService,

    ) { }
    
    @WebSocketServer() server: Server;
    
    async handleConnection(socket: Socket) {
        const userId = await this.getUserId(socket);
        if (userId) {
            console.log("New player connected:", userId);
            const game = this.gameService.getGameByUserId(userId, socket.id);
            if (game && game.player1.ready && game.player2.ready) {
                this.startGame(game.gameId);
            }
        }
    }

    handleDisconnect(socket: Socket) {
        console.log("Player disconnected");
    }

    private async getUserId(socket: Socket) {
        const jwt = this.extractJwtFromSocket(socket);
        if (jwt) {
            const payload = await this.authService.getUserFromToken(jwt);
            return payload["sub"];
        }
        return null;
    }

    private extractJwtFromSocket(socket: Socket): string | null {
        const cookieHeaderValue = socket.request.headers.cookie?.split(";");
        return cookieHeaderValue?.at(0)?.split("=")[1] || null;
    }

    private updatePaddlesPosition(gameData: GameDto) {
        const paddles = gameData.paddles;
        const width = gameData.tableWidth;

        if (paddles.paddle1.x + paddles.paddle1.dx >= 0 && paddles.paddle1.x + paddles.paddle1.dx + paddles.width <= width) {
            paddles.paddle1.x += paddles.paddle1.dx;
        }
        if (paddles.paddle2.x + paddles.paddle2.dx >= 0 && paddles.paddle2.x + paddles.paddle2.dx + paddles.width <= width) {
            paddles.paddle2.x += paddles.paddle2.dx;
        }
    }

    
    private restBallPosition(gameData: GameDto) {
        const ball = gameData.ball;
        const width = gameData.tableWidth;
        const height = gameData.tableHeight;
        ball.x = width / 2;
        ball.y = height / 2;
        ball.dy *= -1;
        ball.dx *= -1;
    }

    private handleBall(gameData: GameDto): boolean {
        const ball = gameData.ball;
        const paddles = gameData.paddles;
        const width = gameData.tableWidth;
        let newBallX = ball.x + ball.dx;
        let newBallY = ball.y + ball.dy;

        // handle ball and wall collision
        if (newBallX - ball.radius <= 0 || newBallX + ball.radius >= width) {
            ball.dx *= -1;
        }

        // Check for collision with paddle 2 (bottom paddle)
        if (newBallY + ball.radius >= paddles.paddle2.y
            && newBallX + ball.radius >= paddles.paddle2.x
            && newBallX - ball.radius <= paddles.paddle2.x + paddles.width
        ) {
            console.log("paddle 2 hit");
            let middlePaddle2 = paddles.paddle2.x + paddles.width / 2;
            let distanceBallXPaddleMiddle = ball.x - middlePaddle2;
            let newAngel = (((paddles.width / 2) - (distanceBallXPaddleMiddle)) / (paddles.width / 2)) * (Math.PI / 2);
            ball.dx = ball.speed * (Math.cos(newAngel));
            ball.dy = ball.speed * (Math.sin(newAngel));
            ball.dy *= -1;
        }

        // Check for collision with paddle 1 (top paddle)
        if (newBallY - ball.radius <= paddles.paddle1.y + paddles.height
            && newBallX + ball.radius >= paddles.paddle1.x
            && newBallX - ball.radius <= paddles.paddle1.x + paddles.width) {
            console.log("paddle 1 hit");
            let middlePaddle1 = newBallX + paddles.width / 2;
            let distanceBallXPaddleMiddle = paddles.paddle1.x - middlePaddle1;
            let newAngel = (((paddles.width / 2) - (distanceBallXPaddleMiddle)) / (paddles.width / 2)) * (Math.PI / 2);
            ball.dx = ball.speed * (Math.cos(newAngel));
            ball.dy = ball.speed * (Math.sin(newAngel));
            ball.dy *= -1;
        }

        // check for Goal
        if (newBallY + ball.radius >= paddles.paddle2.y + (paddles.height)) {
            gameData.player1.score++;
            this.restBallPosition(gameData);
        }

        if (newBallY - ball.radius <= paddles.paddle1.y) {
            gameData.player2.score++;
            this.restBallPosition(gameData);
        }
        if (gameData.player2.score === 10 || gameData.player1.score === 10) {
            if (gameData.player2.score === 10) {
                this.server.to(gameData.player2.socketId).emit("gameOver", gameData.player2.userId, gameData.player1.score, gameData.player2.score);
                this.server.to(gameData.player1.socketId).emit("gameOver", gameData.player2.userId, gameData.player1.score, gameData.player2.score);

            }
            else if (gameData.player1.score === 10) {
                this.server.to(gameData.player1.socketId).emit("gameOver", gameData.player1.userId, gameData.player1.score, gameData.player2.score);
                this.server.to(gameData.player2.socketId).emit("gameOver", gameData.player1.userId, gameData.player1.score, gameData.player2.score);
            }
            this.gameService.deleteGame(gameData.gameId);
            return false;
        }

        ball.x += ball.dx;
        ball.y += ball.dy;
        return true;

    }

    private startGame(gameId: string) {
        const gameData = this.gameService.getGame(gameId);
        let gamePlayed = true;
        if (gameData.player1 && gameData.player2) {
            const interval = setInterval(() => {
                this.updatePaddlesPosition(gameData);
                gamePlayed = this.handleBall(gameData);
                if (!gamePlayed) {
                    clearInterval(interval);
                }
                const client1Ball = { ...gameData.ball };
                const client2Ball = { ...gameData.ball };
                this.server.to(gameData.player2.socketId).emit("move", gameData.player2.userId, client1Ball, gameData.paddles, gameData.player1.score, gameData.player2.score, gameData);
                client2Ball.y = gameData.tableHeight - client2Ball.y;
                this.server.to(gameData.player1.socketId).emit("move", gameData.player2.userId, client2Ball, gameData.paddles, gameData.player1.score, gameData.player2.score, gameData);
            }, 1000 / 60);
        }
    }

    @SubscribeMessage("move")
    async handleMove(socket: Socket, data: any) {
        const gameId = data[1];
        const gameData = this.gameService.getGame(gameId);
        const user = await this.getUserId(socket);

        if (gameData && user) {
            const paddles = gameData.paddles;
            if (user === gameData.player1.userId) {
                paddles.paddle1.dx = data[0] === "left" ? -paddles.speed : paddles.speed;
            } else if (user === gameData.player2.userId) {
                paddles.paddle2.dx = data[0] === "left" ? -paddles.speed : paddles.speed;
            }
        }
    }

    @SubscribeMessage("stop")
    async handleStop(socket: Socket, data: any) {
        const gameId = data[1];
        const gameData = this.gameService.getGame(gameId);
        const user = await this.getUserId(socket);

        if (gameData && user) {
            const paddles = gameData.paddles;
            if (user === gameData.player1.userId) {
                paddles.paddle1.dx = 0;
            } else if (user === gameData.player2.userId) {
                paddles.paddle2.dx = 0;
            }
        }
    }
}