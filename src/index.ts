import  { httpServer } from "./app";
import { PORT } from "./configs";
import { connectDB } from "./database/mongodb";

async function startServer(){
    await connectDB();
    httpServer.listen(PORT, () => {
        console.log(`server: http://localhost:${PORT}`);
        console.log(`Socket.IO: ws://localhost:${PORT}`);

    });

}

startServer();

