// 載入 Express 框架與 morgan 日誌套件
const express = require("express")
const morgan = require("morgan")
// 建立 Express 應用程式
const app = express()

// middleware：把請求 body 的 JSON 字串解析成物件，放到 req.body
// 必須放在 morgan 之前，:body token 才讀得到解析後的資料
app.use(express.json())
// 自訂 morgan token「body」：把 req.body 轉成字串輸出（沒有 body 時會印出 -）
morgan.token("body",(req)=>JSON.stringify(req.body))
// middleware：每個請求回應後，在終端機印出一行日誌
// 格式 = tiny 預設的內容（方法、路徑、狀態碼、回應大小、回應時間）+ 自訂的 :body
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :body"))

// 電話簿資料（存在記憶體中，伺服器重啟後會恢復成這份初始資料）
let persons=[
    {
      "id": "1",
      "name": "Arto Hellas",
      "number": "040-123456"
    },
    {
      "id": "2",
      "name": "Ada Lovelace",
      "number": "39-44-5323523"
    },
    {
      "id": "3",
      "name": "Dan Abramov",
      "number": "12-43-234345"
    },
    {
      "id": "4",
      "name": "Mary Poppendieck",
      "number": "39-23-6423122"
    }
]

// GET /info：回傳電話簿的人數與目前時間（HTML）
app.get("/info",(req,res)=>{
    res.send(`
        <p>Phonebook has info for ${persons.length} people</p>
        <p>${new Date()}</p>
        `)
})

// GET /api/persons：回傳所有聯絡人（JSON）
app.get("/api/persons",(request,response)=>{
    response.json(persons)
})

// GET /api/persons/:id：依 id 回傳單一聯絡人
app.get("/api/persons/:id",(req,res)=>{
    // 從網址取出 id（字串）
    const id = req.params.id
    // 找出 id 相符的聯絡人，找不到時為 undefined
    const person = persons.find((person)=>person.id===id)
    // 找不到就回 404，並結束回應
    if(!person){
        return res.status(404).end()
    }
    res.json(person)
})

// DELETE /api/persons/:id：刪除指定 id 的聯絡人
app.delete("/api/persons/:id",(req,res)=>{
    const id = req.params.id
    // 留下 id 不相符的聯絡人，等於刪掉相符的那一筆
    persons = persons.filter((person)=>person.id!==id)
    // 回傳刪除後的完整清單
    res.json(persons)
})


// 產生新聯絡人的 id：清單有資料時取 0~1000 的隨機數，清單為空時回傳 0
const generateId=()=>{
    const randomId = persons.length>0
    ?Math.random()*1000
    :0
    return randomId
}
// POST /api/persons：新增聯絡人
app.post("/api/persons",(req,res)=>{
    // 經 express.json() 解析後的請求資料
    const body=req.body
    // 驗證：name 或 number 缺少時回傳錯誤
    if(!body.name||!body.number){
        return res.status(404).json("name or number missing")
    }
    // 驗證：名字不可重複
    const repeatName = persons.find((person)=>person.name===body.name)
    if(repeatName){
        return res.status(404).json("name must be unique")
    }
    // 建立新的聯絡人物件
    const person={
        id:generateId(),
        name:body.name,
        number:body.number
    }
    // 用 concat 產生新陣列（不直接修改原陣列），再指派回 persons
    persons = persons.concat(person)

    // 回傳新增後的完整清單
    res.json(persons)
})

// 啟動伺服器，監聽 3001 埠
const PORT=3001
app.listen(PORT,()=>{
    console.log(`Server in ${PORT}`)
})
