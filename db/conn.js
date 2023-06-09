const mongoose = require('mongoose')

const db = process.env.DATABASE;

const dbConnect = async () =>{
 try{
    const res = await mongoose.connect(db?db:"mongodb+srv://root:root@cluster0.9vlh4jj.mongodb.net/raftlabs?retryWrites=true&w=majority" ,
        {
            useNewUrlParser : true,
            useUnifiedTopology : true
        }
     
    )
    console.log("Server Connected")
    }
    catch(err){
        console.log(err);
    }
    
}

dbConnect();