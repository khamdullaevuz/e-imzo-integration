let key = "";

document.getElementById("key").addEventListener("input", function () {
  key = this.value;
});

var ws = new WebSocket("wss://127.0.0.1:64443/service/cryptapi");
let certificates = [];

ws.onopen = function () {
  ws.send(
    JSON.stringify({
      plugin: "pfx",
      name: "list_all_certificates",
    })
  );
};
ws.onmessage = function (evt) {
  let data = JSON.parse(evt.data);
  if (data?.certificates) {
    let select = document.getElementById("certificates");
    certificates = data.certificates;

    certificates.forEach((certificate, key) => {
      let option = document.createElement("option");
      option.value = key;
      option.text = certificate.name;
      select.appendChild(option);
    });
  }

  if (data?.keyId) {
    ws.send(
      JSON.stringify({
        plugin: "pkcs7",
        name: "create_pkcs7",
        arguments: [key, data.keyId, "no"],
      })
    );
  }

  if (data?.pkcs7_64) {
    console.log(data.pkcs7_64);
  }
};

document.getElementById("submit").addEventListener("click", function () {
  let select = document.getElementById("certificates");
  let certificate = certificates[select.value];
  ws.send(
    JSON.stringify({
      plugin: "pfx",
      name: "load_key",
      arguments: [
        certificate.disk,
        certificate.path,
        certificate.name,
        certificate.alias,
      ],
    })
  );
});
