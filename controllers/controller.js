module.exports.getClosures = (req, res) => {
  client.query("SELECT lat, long, filenumber, saledate FROM foreclosures WHERE status = 'TD';", (err, data) => {
    if(err){
      res.send(err)
    }else{
      res.send(data.rows);
    }
  })
}
