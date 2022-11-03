document.addEventListener("DOMContentLoaded", () => {

    const small = window.innerWidth < 700
    const pxSize = small ? 6 : 12

    const getInitialSnake = (position, direction) => {
        const [x, y] = position
        if(direction === "U"){
            return [
                position,
                [x, y+1],
                [x, y+2],
                [x, y+3],
                [x, y+4],
                [x, y+5],
                [x, y+6]
            ]
        } else if(direction === "R"){
            return [
                position,
                [x-1, y],
                [x-2, y],
                [x-3, y],
                [x-4, y],
                [x-5, y],
                [x-6, y]
            ]
        } else if(direction === "D"){
            return [
                position,
                [x, y-1],
                [x, y-2],
                [x, y-3],
                [x, y-4],
                [x, y-5],
                [x, y-6]
            ]
        } else if(direction === "L"){
            return [
                position,
                [x+1, y],
                [x+2, y],
                [x+3, y],
                [x+4, y],
                [x+5, y],
                [x+6, y]
            ]
        }
    }
    
    const amIEatingMyself = snake => {
        const head = snake[0]
        const rest = snake.slice(1)
        return rest.some(([x, y]) => {
            return x === head[0] && y === head[1]
        })
    }
    
    const moveIt = snake => {
        if(directionArr.length > 0){
            const newDirection = directionArr[0]
            if(
                newDirection === "U" && direction !== "D" ||
                newDirection === "D" && direction !== "U" ||
                newDirection === "L" && direction !== "R" ||
                newDirection === "R" && direction !== "L"
            ){
                direction = newDirection
            }
            directionArr = directionArr.slice(1)
        }

        if(direction === "U"){ snake = snake.map(([x, y], i) => i === 0 ? [x, y-1] : snake[i-1]) }
        if(direction === "R"){ snake = snake.map(([x, y], i) => i === 0 ? [x+1, y] : snake[i-1]) }
        if(direction === "D"){ snake = snake.map(([x, y], i) => i === 0 ? [x, y+1] : snake[i-1]) }
        if(direction === "L"){ snake = snake.map(([x, y], i) => i === 0 ? [x-1, y] : snake[i-1]) }
    
        const [headX, headY] = snake[0]
        if(
            //BORDER COLLISION
            headX === -1  ||
            headY === -1  ||
            headX === (((small ? 300 : 600) / pxSize)) ||
            headY === (((small ? 300 : 600) / pxSize)) ||
    
            //OWN COLLISION
            amIEatingMyself(snake)
        ){
            ded.play()
            snake = false
            endPointsMarker.innerText = points

            const oldRecord = parseInt(window.localStorage.record || "0")
            if(points > oldRecord){
                document.querySelector("#record").innerText = "NEW RECORD!!"
                window.localStorage.setItem("record", points)
            } else {
                document.querySelector("#record").innerText = `YOUR HIGHEST SCORE IS ${oldRecord} POINTS`
            }

            pointsMarker.style.display = "none"
            levelMarker.style.display = "none"
            endTitles.style.display = "flex"
            status = "DED"
        } else if(
            //FOUND FOOD!!
            headX === food[0] && headY === food[1]
        ) {
            snake = [food, ...snake]
            eat.play()
            eaten++
            points += level
            if(!(eaten % 10)){ //LEVEL UP!!
                level++
                levelUp.play()
                clearInterval(ticker)
                speed = speed * 0.8
                createTicker(speed)
            }
            food = generateFood(snake)
        }
        return snake
    }

    const generateFood = snake => {
        const newFood = [2 + Math.trunc(Math.random()*(((small ? 300 : 600)/pxSize) - 2)),2 + Math.trunc(Math.random()*(((small ? 300 : 600)/pxSize) - 2))]
        if(snake.some(([x, y]) => newFood[0] > (x-1) && newFood[0] < (x+1) && newFood[1] > (y-1) && newFood[1] < (y+1))){ //NOT SO CLOSE
            return generateFood(snake)
        } else {
            return newFood
        }
    }

    const createTicker = speed => {
        ticker = setInterval(() => {

            beep[tick%4].play()
            
            const toFlush = document.querySelectorAll(".darkPx")
            toFlush.forEach(it => screen.removeChild(it))

            snake = moveIt(snake, directionArr)
            if(!snake){ 
                clearInterval(ticker) 
                return
            } //ded

            [...snake, food].forEach(([x, y]) => {
                const node = document.createElement("div");
                node.classList.add("darkPx")
                node.style.top = y*pxSize + "px"
                node.style.left = x*pxSize + "px"
                screen.appendChild(node);
                directionDebug.innerText = direction
                speedDebug.innerText = speed + "ms"
                pointsMarker.innerText = "POINTS: " + points
                levelMarker.innerText = "LEVEL:" + level
            })
            tick++
        }, speed)
    }
    
    const screen = document.querySelector("#screen")
    let ticker = undefined

    const beep = document.querySelectorAll(".beep")
    const ded = document.querySelector("#ded")
    const eat = document.querySelector("#eat")
    const levelUp = document.querySelector("#levelUp")

    const directionDebug = document.querySelector("#direction")
    const speedDebug = document.querySelector("#tickerSpeed")
    const pointsMarker = document.querySelector("#points")
    const endPointsMarker = document.querySelector("#endPoints")
    const levelMarker = document.querySelector("#level")
    const startTitles = document.querySelector("#start")
    const endTitles = document.querySelector("#end")

    let initialPosition = [6 + Math.trunc(Math.random()*(((small ? 300 : 600)/pxSize) - 12)),6 + Math.trunc(Math.random()*((600/pxSize) - 12))]
    let direction = ["U", "R", "D", "L"][Math.trunc(Math.random()*4)]
    let directionArr = []
    let snake
    let food
    let tick
    let points
    let eaten
    let level
    let speed 
    let status = "START"

    ded.volume = 0.8;
    levelUp.volume = 0.8;
    eat.volume = 0.5;

    const startGame = () => {
        initialPosition = [6 + Math.trunc(Math.random()*(((small ? 300 : 600)/pxSize) - 12)),6 + Math.trunc(Math.random()*(((small ? 300 : 600)/pxSize) - 12))]
        direction = ["U", "R", "D", "L"][Math.trunc(Math.random()*4)]
        snake = getInitialSnake(initialPosition, direction)
        food = generateFood(snake)
        tick = 0
        points = 0
        eaten = 0
        level = 1
        speed = 120
        directionArr = []
        status = "PLAYING"
        createTicker(speed)
        pointsMarker.style.display = "block"
        levelMarker.style.display = "block"
        startTitles.style.display = "none"
        endTitles.style.display = "none"
    }


    beep[0].volume = 0.025;
    beep[1].volume = 0.005;
    beep[2].volume = 0.015;
    beep[3].volume = 0.01;
    beep[4].volume = 0.02;
    beep[5].volume = 0.005;
    beep[6].volume = 0.02;

    document.addEventListener("keydown", evt => {
        if(["ArrowUp", "w", "W"].includes(evt.key))         { directionArr.push("U") }
        else if(["ArrowRight", "d", "D"].includes(evt.key)) { directionArr.push("R") }
        else if(["ArrowDown", "s", "S"].includes(evt.key))  { directionArr.push("D") }
        else if(["ArrowLeft", "a", "A"].includes(evt.key))  { directionArr.push("L") }
        else if(evt.key === "Enter" && ["START", "DED"].includes(status))        { startGame()     }
    })


    const upBtn = document.querySelector("#up")
    const downBtn = document.querySelector("#down")
    const leftBtn = document.querySelector("#left")
    const rightBtn = document.querySelector("#right")
    const centerBtn = document.querySelector("#center")
 
    upBtn.addEventListener("click", () => {
        if(status === "PLAYING"){ directionArr.push("U") }
        else{ startGame() }
    })
    downBtn.addEventListener("click", () => {
        if(status === "PLAYING"){ directionArr.push("D") }
        else{ startGame() }
    })
    leftBtn.addEventListener("click", () => {
        if(status === "PLAYING"){ directionArr.push("L") }
        else{ startGame() }
    })
    rightBtn.addEventListener("click", () => {
        if(status === "PLAYING"){ directionArr.push("R") }
        else{ startGame() }
    })
    centerBtn.addEventListener("click", () => startGame() )
    
})