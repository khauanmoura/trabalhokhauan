const URL_API = "http://app.professordaniloalves.com.br";

$('.scrollSuave').click(() => {
    $('html, body').animate(
        { scrollTop: $(event.target.getAttribute('href')).offset().top - 100 }, 500);
});

$('#cadastroDeAcordo').change(function () {
    $('#btnSubmitCadastro').attr("disabled", !this.checked);
});

    const formularioCadastro = document.getElementById("formCadastro");
    formularioCadastro.addEventListener("submit", enviarFormularioCadastro, true);

function enviarFormularioCadastro(event) {
    event.preventDefault();

        $("#formCadastro .invalid-feedback").remove();
        $("#formCadastro .is-invalid").removeClass("is-invalid");

    fetch(URL_API + "/api/v1/cadastro", {
        method: "POST",
        headers: new Headers({
            Accept: "application/json",
            'Content-Type': "application/json",
        }),
        body: JSON.stringify({
           
                    nomeCompleto: document.getElementById("cadastroNomeCompleto").value,
                
                    dataNascimento: document.getElementById("cadastroDataNascimento").value,
                    
                    sexo: document.querySelector("[name=cadastroSexo]:checked").value,
                    
                    cep: document.getElementById("cadastroCep").value.replace("-", ""),
                
                    cpf: document.getElementById("cadastroCpf").value.replace(".", "").replace(".", "").replace("-", ""),
                    
                    uf: document.getElementById("cadastroUf").value,
                    
                    cidade: document.getElementById("cadastroCidade").value,
                    
                    logradouro: document.getElementById("cadastroLogradouro").value,
                
                    numeroLogradouro: document.getElementById("cadastroNumeroLogradouro").value,
                    
                    email: document.getElementById("cadastroEmail").value,
                    
                    expectativa: document.getElementById("cadastroExpectativa").value,
        })
    })

        .then(response => {
            return new Promise((myResolve, myReject) => {
                response.json().then(json => {
                    myResolve({ "status": response.status, json });
                });
            });
        })
        .then(response => {
            if (response && response.status === 422 && response.json.errors) {


                Object.entries(response.json.errors).forEach((obj, index) => {
                    const id = fazNomeIdCadastro(obj[0]);
                    const texto = obj[1][0];
                    console.log(id);
                    console.log(texto);
                    erroCadastro(id, texto, index == 0);

                })
            } else if(response && response.json.message){
                alert(response.json.message);
                limpa();
               } else {
                console.log(response)
                limpa();
            }
        });
}



popularListaEstados();

function popularListaEstados() {
    fetch(URL_API + "/api/v1/endereco/estados", {
        method: "GET",
        headers: new Headers({
            Accept: "application/json"
        })
    })
        .then(response => {
            return response.json();
        }).then(estados => {
            const elSelecetUF = document.getElementById("cadastroUf");
            estados.forEach((estado) => {
                elSelecetUF.appendChild(criarOption(estado.uf, estado.nome));
            })
        }).catch(err => {
            alert("Erro ao salvar cadastro");
            console.log(err);
        })

}

function criarOption(valor, texto) {
    const node = document.createElement("option");
    const textnode = document.createTextNode(texto)
    node.appendChild(textnode);
    node.value = valor;
    return node;
}

//PREENCHE O CEP
function popularEnderecoCadastro() {
    var inputCep = document.getElementById("cadastroCep")
    var cepCompleto = inputCep.value.replace("-", "");
    if (cepCompleto == null || cepCompleto == undefined || cepCompleto.length != 8) {
        console.log("CEP inválido");

    } else {
        fetch(URL_API + "/api/v1/endereco/" + cepCompleto, {
            method: "GET",
            headers: new Headers({
                Accept: "application/json",
                'Content-Type': "application/json",
            }),
        })
            .then(response => {
                return response.json();
            }).then(jsonCep => {
                if (jsonCep && !jsonCep.message) {
                    var logradouro = document.getElementById("cadastroLogradouro");
                    var estado = document.getElementById("cadastroUf");
                    var cidade = document.getElementById("cadastroCidade");
                    logradouro.value = jsonCep.logradouro ? jsonCep.logradouro : "";
                    estado.value = jsonCep.uf ? jsonCep.uf : "";
                    cidade.value = jsonCep.localidade ? jsonCep.localidade : "";
                } else {
                    console.log(jsonCep.message);

                }
            }).catch(err => {
                console.log(err);
            })
    }

}

$('#btnCalcularIMC').click(() => {
    $("#resultadoIMC").html("");
    $("#formImc .invalid-feedback").remove();
    $("#formImc .is-invalid").removeClass("is-invalid");

    fetch(URL_API + "/api/v1/imc/calcular", {
        method: "POST",
        headers: new Headers({
            Accept: "application/json",
            'Content-Type': "application/json",
        }),
        body: JSON.stringify({
            peso: document.getElementById("pesoImc").value,
            altura: document.getElementById("alturaImc").value,
        })
    })
        .then(response => {
            return new Promise((myResolve, myReject) => {
                response.json().then(json => {
                    myResolve({ "status": response.status, json });
                });
            });
        }).then(response => {
            if (response && response.json.errors) {
                Object.entries(response.json.errors).forEach((obj, index) => {
                    const id = parseIdImc(obj[0]);
                    const texto = obj[1][0];
                    criarDivImcDeCampoInvalido(id, texto, index == 0);
                })
            } else {
                $("#resultadoIMC").html(response.json.message);
                $('#modalResultadoIMC').modal('show');
            }
        }).catch(err => {
            $("#resultadoIMC").html("Ocorreu um erro ao tentar calcular seu IMC.");
            $('#modalResultadoIMC').modal('show');
            console.log(err);
        });

});

//FUNÇÕES

function parseIdImc(id) {
    return id + "Imc";
}

function criarDivImcDeCampoInvalido(idItem, textoErro, isFocarNoCampo) {
    const el = document.getElementById(idItem);
    isFocarNoCampo && el.focus();
    el.classList.add("is-invalid");
    const node = document.createElement("div");
    const textnode = document.createTextNode(textoErro);
    node.appendChild(textnode);
    const elDiv = el.parentElement.appendChild(node);
    elDiv.classList.add("invalid-feedback");
}
function fazNomeIdCadastro(id) {
    return "cadastro" + deixaLetraMaiuscula(id);
}

    function erroCadastro(idItem, textoErro, isFocarNoCampo) {
        const el = document.getElementById(idItem);
        isFocarNoCampo && el.focus();
        el.classList.add("is-invalid");
        const node = document.createElement("div");
        const textnode = document.createTextNode(textoErro);
        node.appendChild(textnode);
        const elDiv = el.parentElement.appendChild(node);
        elDiv.classList.add("invalid-feedback");
    }

function deixaLetraMaiuscula(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

    function limpa() {
        
        document.getElementById("cadastroNomeCompleto").value = null;
        
        document.getElementById("cadastroDataNascimento").value = null;
        
        document.querySelector("[name=cadastroSexo]:checked").value = null;
        
        document.getElementById("cadastroCep").value = null;
        
        document.getElementById("cadastroCpf").value = null;
        
        document.getElementById("cadastroUf").value = null;
        
        document.getElementById("cadastroCidade").value = null;
        
        document.getElementById("cadastroLogradouro").value = null;
        
        document.getElementById("cadastroNumeroLogradouro").value = null;
        
        document.getElementById("cadastroEmail").value = null;
    }