var builder = require('xmlbuilder');




exports.storeTB = function (tb, callback) {


  try {

    fs.unlinkSync(dirPath + client + "\\DashBoard.xml");

  } catch (e) { }

  var xml = builder.create('DashTable');
  var amount


  for (ctr = 0; ctr < tb.length; ctr++) {


    amount = tb[ctr].debit * 1 + tb[ctr].credit * -1

    

    xml.ele('Row').ele('Amount').txt(amount).up()
      .ele('Account').text(tb[ctr].name).up()
      .ele('Month').text(tb[ctr].month).up()
      .ele('Day').text(tb[ctr].day).up()
      .ele('Year').text(tb[ctr].year).up().up()


  }







  var xmldoc = xml.toString({ pretty: true });

  console.log(xmldoc)
  callback(xmldoc)



}