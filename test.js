const pdf = require("html-pdf");
var fs = require("fs"),
  path = require("path"),
  filePath = path.join(__dirname, "test.html");

fs.readFile(filePath, { encoding: "utf-8" }, function (err, data) {
  if (!err) {
    let options = {
      width: "7.5cm",
      localUrlAccess: true,
    };

    pdf.create(data, options).toFile("test.pdf", () => {
      console.log("hey");
    });
  } else {
    console.log(err);
  }
});
