exports.getJson =  function (req, res) {

 res.status(200).json(req.body.message)


}