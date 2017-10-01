$(document).ready(function () {

    var SNAKE = SNAKE || {
        view: {},
        controller: {},
        config: {}
    };

    (function initConfig() {
        this.$canvas = $('#snakeCanvas');
        this.gameWidth = this.$canvas.width();
        this.gameHeight = this.$canvas.height();
        this.cellWidth = 10;
        this.snakeLength = 5;
        this.speed = 60;
        this.scoreTextStyle = '15px Verdana';
        this.color = {
            background: '#ffffff',
            boardBorder: '#2c3e50',
            score: '#895434',
            snake: {
                fill: '#e67e22',
                border: '#e357ee'
            },
            food: {
                fill: '#160a32',
                border: '#2e45ff'
            }
        }
        this.keyCode = {
            UP: '38', //para cima
            DOWN: '40', //para baixo
            LEFT: '37', //para a esquerda
            RiGHT: '39', //para a direita
            P: '80', //dar pause
            C: '67' //continua
        }
    }).call(SNAKE.config);

    (function initView(config) {
        var $canvas = config.$canvas[0],
            context = $canvas.getContext('2d');

        var paintCell = function (x, y, color) {
            var cellWidth = config.cellWidth;

            context.fillStyle = color.fill;
            context.fillRect(x * cellWidth, y * cellWidth, cellWidth, cellWidth);
            context.strokeStyle = color.border;
            context.strokeRect(x * cellWidth, y * cellWidth, cellWidth, cellWidth);
        }

        var paintGameBoard = function () {
            var background = config.color.background,
                gameWidth = config.gameWidth,
                gameHeight = config.gameHeight,
                boardBorder = config.color.boardBorder;

            context.fillStyle = background;
            context.fillRect(0, 0, gameWidth, gameHeight);
            context.strokeStyle = boardBorder;
            context.strokeRect(0, 0, gameWidth, gameHeight);
        }

        var paintSnake = function (snake) {
            var snakeColor = config.color.snake;

            for (indice in snake) {
                var snakeCell = snake[indice];
                paintCell(snakeCell.x, snakeCell.y, snakeColor);
            }
        }


        var paintScore = function (score) {
            var scoreColor = config.color.score,
                scoreTextStyle = config.scoreTextStyle;

            context.font = scoreTextStyle;
            context.fillStyle = scoreColor;
            context.fillText(score, 5, 20);

        }


        this.refresh = function (food, snake, score) {
            var foodColor = config.color.food;

            paintGameBoard();
            paintSnake(snake);
            paintCell(food.x, food.y, foodColor);
            paintScore(score);
        }


    }).call(SNAKE.view, SNAKE.config);

    (function initController(config, view) {
        var food,
            snake,
            score,
            direction,
            gameLoop,
            that = this;
        var createSnake = function () {
            var snakeLength = config.snakeLength;

            snake = [];

            for (var i = snakeLength - 1; i >= 0; i--) {
                snake.push({
                    x: i,
                    y: 0
                })
            }
        }

        var createFood = function () {
            var cellWidth = config.cellWidth,
                gameWidth = config.gameWidth,
                gameHeight = config.gameHeight,
                randomX = Math.round(Math.random() * (gameWidth - cellWidth) / cellWidth),
                randomY = Math.round(Math.random() * (gameWidth - cellWidth) / cellWidth);

            food = {
                x: randomX,
                y: randomY
            }
        }
        //Controles de direção
        var addKeyEventListeners = function () {
            var keyCode = config.keyCode;

            $(document).off('keydown').on('keydown', function (event) {
                var pressedKey = event.which;

                if (pressedKey == keyCode.LEFT && direction != 'right') {
                    direction = 'left';
                } else if (pressedKey == keyCode.RiGHT && direction != 'left') {
                    direction = 'right';
                } else if (pressedKey == keyCode.UP && direction != 'down') {
                    direction = 'up';
                } else if (pressedKey == keyCode.DOWN && direction != 'up') {
                    direction = 'down';
                } else if (pressedKey == keyCode.P) {
                    that.stopLooping();
                    console.log("Game Paused!");
                } else if (pressedKey == keyCode.C) {
                    that.startLooping();
                    console.log("Game Continuing");
                }
            });
        }

        var checkBodyCollision = function (head) {
            for (indice in snake) {
                var snakeCell = snake[indice];
                if (snakeCell.x == head.x && snakeCell.y == head.y) {
                    return true;
                }
            }
        };

        var checkCollision = function (head) {
            var leftCollision = head.x == -1,
                rightCollision = head.x == config.gameWidth / config.cellWidth;
            bottomCollision = head.y == -1;
            topCollision = head.y == config.gameHeight / config.cellWidth;
            if (leftCollision || rightCollision || bottomCollision || topCollision || checkBodyCollision(head)) {
                throw new Error('Sorry! You lost the Game! ;D');
                console.log("Sorry! You lost the Game! ;D");
            }
        };

        //Indica a direção da cobra
        var chooseSnakeDirection = function () {
            var head = {
                x: snake[0].x,
                y: snake[0].y
            }

            if (direction == 'right') {
                head.x++;
            } else if (direction == 'left') {
                head.x--;
            } else if (direction == 'up') {
                head.y--;
            } else if (direction == 'down') {
                head.y++;
            }
            return head;
        }

        //Incrementa a pontuação
        var incrementScore = function () {
            score++;
        }

        //Verifica se a cobra comeu
        var checkSnakeEatFood = function (head) {
            if (head.x == food.x && head.y == food.y) {
                var tail = {
                    x: head.x,
                    y: head.y
                }
                incrementScore(); //incrementa a pontuação
                console.log(incrementScore());
                createFood();
            } else {
                var tail = snake.pop();
                tail.x = head.x;
                tail.y = head.y;
            }
            //Retorna a rabeta da cobra
            return tail;
        }

        //Realiza o movimento da cobra
        var makeSnakeMovement = function (tail) {
            snake.unshift(tail);
        };

        var gameRefresh = function () {
            try {
                var newHeadPosition, tail;

                newHeadPosition = chooseSnakeDirection();
                checkCollision(newHeadPosition);
                tail = checkSnakeEatFood(newHeadPosition);
                makeSnakeMovement(tail);
                view.refresh(food, snake, score);
            } catch (e) {
                alert(e.message);
                console.log(e.message);
                SNAKE.init(SNAKE.controller, SNAKE.config, SNAKE.view);
            }
        };

        this.initGameDefault = function () {
            var snakeLength = config.snakeLength;

            addKeyEventListeners();
            direction = 'right';
            createSnake();
            createFood();
            score = snakeLength;
        };

        this.startLooping = function () {
            if (typeof gameLoop != "undefined") {
                clearInterval(gameLoop);
            }
            gameLoop = setInterval(gameRefresh, config.speed);
        };

        this.stopLooping = function () {
            if (typeof gameLoop != "undefined") {
                clearInterval(gameLoop);
            }
            gameRefresh();
        }

    }).call(SNAKE.controller, SNAKE.config, SNAKE.view);

    SNAKE.init = function (controller, config, view) {
        controller.initGameDefault();
        controller.startLooping();
    }

    SNAKE.init(SNAKE.controller, SNAKE.config, SNAKE.view);
});