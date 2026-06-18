import express, { Request, Response, urlencoded } from "express"


const app = express()

app.use(express.json())
app.use(urlencoded({ extended: true }))
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json("Coucou")
})

const PORT = process.env.PORT || 8081

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`)
})