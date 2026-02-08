import app from "./app";
import { PORT } from "./configs";
import { connectDB } from "./database/mongodb";

async function startServer(){
    await connectDB();
    app.listen(PORT, () => {
        console.log(`server: http://localhost:${PORT}`);
    })

}

startServer();

