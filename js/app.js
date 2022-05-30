js: const URL_API = "http://app.professordaniloalves.com.br";

/* MENU */
$('.scrollSuave').click(() => {
    $('html, body').animate(
        { scrollTop: $(event.target.getAttribute('href')).offset().top - 100 }, 500);
});


/* ENVIAR CADASTRO */


$("#cadastroDeAcordo").change(function(){
    $("#btnSubmitCadastro").attr("disabled", !this.checked);
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
            cep: document.getElementById("cadastroCep").value.replaceAll("-", ""), 
            cpf: document.getElementById("cadastroCpf").value.replaceAll("-", "").replaceAll(".", ""), 
            uf: document.getElementById("cadastroUf").value, 
            cidade: document.getElementById("cadastroCidade").value, 
            logradouro: document.getElementById("cadastroLogradouro").value, 
            numeroLogradouro: document.getElementById("cadastroNumeroLogradouro").value, 
            email: document.getElementById("cadastroEmail").value, 
            expectativa: document.getElementById("cadastroExpectativa").value
        })
    })
    .then(response => {
        return new Promise((myResolve, myReject) => {
            response.json().then(json => {
                myResolve({ "status": response.status, json });
            });
        });
    }).then(response => {
        if (response && response.status === 422 && response.json.errors) {
            Object.entries(response.json.errors).forEach((obj, index) => {
                const field = obj[0];
                const id = "cadastro" + field.charAt(0).toUpperCase() + field.substring(1);
                const texto = obj[1][0];
                criarDivDeCampoInvalido(id, texto, index == 0);
            })
        }else if(response && response.status >= 400 && response.status <= 599){
            if(response.json.message){
                alert(response.json.message);
            }else{
                alert("Ocorreu um erro não tratado");
            }   
        }else if(response && response.status === 201){
            if(response.json.message){
                alert(response.json.message);
            }else{
                alert("Cadastro realizado com sucesso!");
            }

            formCadastro.reset();
            $("#cadastroDeAcordo").change();
        }
    }).catch(err => {
        alert("Ocorreu um erro não tratado");
        console.log(err);
    });

}

/* FIM ENVIAR CADASTRO */

/* CRIAR LISTA DE ESTADOS */

popularListaEstados();

function popularListaEstados() {
    fetch(URL_API + "/api/v1/endereco/estados", {
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

/* FIM CRIAR LISTA DE ESTADOS */


/* PREENCHER ENDEREÇO */
function popularEnderecoCadastro(){
   fetch("https://app.professordaniloalves.com.br/api/v1/endereco/" + $("#cadastroCep").val(), {
        headers: new Headers({
            Accept: "application/json"
        })
    })
   .then(response => {
       return response.json();
   }).then( endereco => {
        $("#cadastroLogradouro").val(endereco.logradouro),
        $("#cadastroCidade").val(endereco.localidade),
        $("#cadastroUf").val(endereco.uf)
   }).catch(err => {
       console.log(err);
   })
}
/* FIM PREENCHER ENDEREÇO */

/* IMC */

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

function parseIdImc(id) {
    return id + "Imc";
}

/* FIM IMC */

function criarDivDeCampoInvalido(idItem, textoErro, isFocarNoCampo) {
    const el = document.getElementById(idItem);
    isFocarNoCampo && el.focus();
    el.classList.add("is-invalid");
    const node = document.createElement("div");
    const textnode = document.createTextNode(textoErro);
    node.appendChild(textnode);
    const elDiv = el.parentElement.appendChild(node);
    elDiv.classList.add("invalid-feedback");
}


 function buscaCadastro() {
    let inputCpf = document.getElementById("cadastroCpf")
    let inputCpfResposta = inputCpf.value.replaceAll("-", "").replaceAll(".", "");
    if (inputCpfResposta == null || inputCpfResposta == undefined || inputCpfResposta.length != 11) {
        console.log("CPF inválido");

    } else {
             fetch(URL_API + "/api/v1/cadastro/" + inputCpfResposta, {
                method: "GET",
            headers: new Headers({
                        Accept: "application/json",
                    'Content-Type': "application/json",
                                                            }),
        })
            .then(response => {
                return response.json();
            }).then(jsonCpf => {
                if (jsonCpf && !jsonCpf.message) {
                    var inputName = document.getElementById("cadastroNomeCompleto");
                        var inputData = document.getElementById("cadastroDataNascimento");
                             var inputCep = document.getElementById("cadastroCep");
                            var inputEstado = document.getElementById("cadastroUf");
                            var inputLogradouro = document.getElementById("cadastroLogradouro");
                            var inputNumber = document.getElementById("cadastroNumeroLogradouro");
                            var inputEmail = document.getElementById("cadastroEmail");
                    var inputCity = document.getElementById("cadastroCidade");
                    var inputExpectativa = document.getElementById("cadastroExpectativa");

                    inputName.value = jsonCpf.nomeCompleto ? jsonCpf.nomeCompleto : "";
                            inputData.value = jsonCpf.dataNascimento ? jsonCpf.dataNascimento : "";
                            inputCep.value = jsonCpf.cep ? jsonCpf.cep:"";
                                                 inputEstado.value = jsonCpf.uf ? jsonCpf.uf:"";
                                         inputLogradouro.value = jsonCpf.logradouro ? jsonCpf.logradouro:"";
                                            inputNumber.value = jsonCpf.numeroLogradouro ? jsonCpf.numeroLogradouro:"";
                                                inputEmail.value = jsonCpf.email ? jsonCpf.email:"";
                                    inputCity.value = jsonCpf.cidade ? jsonCpf.cidade:"";
                                inputExpectativa.value = jsonCpf.expectativa ? jsonCpf.expectativa:"";
                    document.querySelector("[name=cadastroSexo][value =" + jsonCpf.sexo+"]").checked=true;

                    $('#alertDocumento').modal('show')

                } else {
                    console.log(jsonCpf.message);

                }
            }).catch(err => {
                console.log(err);
            })
    }
}

function apagaCadastro(){
    var inputCpf = document.getElementById("cadastroCpf")
    var inputCpfResposta = inputCpf.value.replaceAll("-", "").replaceAll(".", "");
    fetch(URL_API + "/api/v1/cadastro/" + inputCpfResposta, {
        method: "DELETE",
        headers: new Headers({
            Accept: "application/json",
            'Content-Type': "application/json",
        }),
    }).then(response => {
        formCadastro.reset();
    })
}
