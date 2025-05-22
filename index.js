import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({extended: false}))
app.use(express.static('public'))

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});