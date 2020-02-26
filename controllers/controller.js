module.exports.getClosures = (req, res) => {
  client.query("SELECT lat, long, filenumber, saledate FROM foreclosures ORDER BY saledate ASC;", (err, data) => {
    if(err){
      res.send(err)
    }else{
      res.send(data.rows);
    }
  })
}
