import {app} from './app'
import {connectMongo} from './database/mongoose'

async function bootstrap() {
    const port = Number(process.env.PORT) || 3000;
    await connectMongo();
    app.listen(port, () => {
        console.log(`Bibliotec API: http://localhost:${port}`)
    });
}

bootstrap().catch((err)=>{
    console.error('Fallo al iniciar servidor:',err)
    process.exit(1)
});


