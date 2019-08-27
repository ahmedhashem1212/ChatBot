
const express = require('express');
const all_routes = require('express-list-endpoints')

var cors=require('cors');
const app = express();
const explore = (req, res) => {
    const routes = all_routes(app)
    const result = {
      ServiceList: []
    }
    for (route of routes) {
      const name = route.path.split('/')[4]
      result.ServiceList.push({
        Service: {
          name: name,
          fullUrl: `http://localhost:3333/${route.path}`
        }
      })
    }
    return res.json(result)
   }
app.use(cors());
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use('/explore', explore)
const messages=require('./message.js');
app.use('/api/v1/messages', messages);

   
const port = process.env.PORT || 3333

app.listen(port, () => console.log(`Server on ${port}`))
