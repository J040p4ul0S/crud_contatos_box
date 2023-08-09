const ACCESS = {
    URL_API : "https://api.box3.work/api/Contato",
    TOKEN : "dce9d278-f758-466f-bfaf-b3a9fd71241e"
}

const ATIVO_TEXTO = {
    true: "Sim",
    false:"Não"
}

const maskTelephone = (event) => {
    let input = event.target
    input.value = phoneMask(input.value)
  }

const phoneMask = (value) => {
    if (!value) return ""
    value = value.replace(/\D/g,'')
    value = value.replace(/(\d{2})(\d)/,"($1) $2")
    value = value.replace(/(\d)(\d{4})$/,"$1-$2")
    return value
}
function formatarData(dataString) {
    const data = new Date(dataString);
    const dia = data.getDate().toString().padStart(2, '0')
    const mes = (data.getMonth() + 1).toString().padStart(2, '0') // Mês começa em 0 (janeiro)
    const ano = data.getFullYear()
    
    return `${dia}/${mes}/${ano}`
}

const insertContact = async (data, method, ID) => {
    async function add() { 
        try {
            let options = {
                method : method,
                body : JSON.stringify(data),
                headers: { "Content-type": "application/json; charset=UTF-8" }
            }

            if (method==="PUT"){await fetch(`${ACCESS.URL_API}/${ACCESS.TOKEN}/${ID}`, options)}
            else{await fetch(`${ACCESS.URL_API}/${ACCESS.TOKEN}`, options)}
        } catch (err) {
            console.error(err)
            return err
        }
    }

    await add(data)
    getData()

}

/*let array_all_contacts = [
    {
        id:34,
        nome : "João",
        telefone : "(99) 999-999",
        dataNascimento : "2/2/2",
        email : "joaopaulo@gmail.com",
        ativo : true,
        
    },
    {
        id:34,
        nome : "maria",
        telefone : "(99) 999-999",
        dataNascimento : "2/2/2",
        email : "joaopaulo@gmail.com",
        ativo : true,
        
    }
]*/

let array_all_contacts

function clearTable(){
    const tbody = document.querySelector('#tbody-c')
    
    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild)
    }
}

function searchContact(event) {
    event.preventDefault()
    p = document.querySelector("#search").value
    clearTable()    
    if (document.querySelector("#search").value === "") {
        array_all_contacts.forEach((data) =>{
            setDataTable(data)
        })
        return
    }
    
    padrao = new RegExp(p, 'i');
    let result = array_all_contacts.filter(data => padrao.test(data.nome))
    
    result.forEach((data) =>{
        setDataTable(data)
    })  
}

const editContact = async (ID) => {
    let data = await getContact(ID)
    modal.style.display = "block";
    const { id, nome, telefone, dataNascimento, email, ativo } = data
    let modaledit = document.querySelector(".modal-header")
    let modal_bnt = document.querySelector("#bnt-enviar")
    
    let modal_nome = document.querySelector("#nome")
    let modal_telefone = document.querySelector("#telefone")
    let modal_email = document.querySelector("#email")
    let modal_data_nascimento = document.querySelector("#data_nascimento")
    let modal_ativo = document.querySelector("#ativo")


    let modal_span_contact = document.querySelector("#id_contact")

    modal_span_contact.name = id
    
    modal_bnt.name = "salvar"
    modaledit.textContent = "Editar Contato"
    
    modal_nome.value = nome
    modal_telefone.value = telefone
    modal_email.value = email
    const data_nacimento = String(dataNascimento).split("-");
    modal_data_nascimento.value = data_nacimento[0] + "-" + data_nacimento[1] + "-" + data_nacimento[2].split("T")[0]
    modal_ativo.checked = ativo
    modal_bnt.textContent = "Confirmar"
}

const deleteContact = async(ID) => {
    async function deleteC() { 
        try {
            let options = {
                method : "DELETE",
                headers: { "Content-type": "application/json; charset=UTF-8" }
            }
            await fetch(`${ACCESS.URL_API}/${ACCESS.TOKEN}/${ID}`, options)
        } catch (err) {
            console.log("Ocorreu um erro")
            console.error(err)
            return err
        }
    }
    await deleteC()// Aguardar a exclusão
    clearTable()
    await getData() // Aguardar a busca de dados novamente
}


const getContacts = async () => {
    array_all_contacts = null
    try{
        await fetch(`${ACCESS.URL_API}/${ACCESS.TOKEN}`).then(response => {
                if (!response.ok) {
                throw new Error('Erro na requisição')
                }
                return response.json()
            })
            .then(data => {
                array_all_contacts = data
            })
        
    } catch (err) {
        console.error(err)
        return err
    }
    return array_all_contacts
}

const getContact = async (ID) => {
    object = null
    try{
        await fetch(`${ACCESS.URL_API}/${ACCESS.TOKEN}/${ID}`).then(response => {
                if (!response.ok) {
                throw new Error('Erro na requisição')
                }
                return response.json()
            })
            .then(data => {
                object = data
            })  
       
    } catch (err) {
        console.error(err)
        return err
    }
    return object
}

const newContact = async (event)=>  {
    event.preventDefault()

    const form = document.querySelector("#form-contacts")

    if (form.nome.value==="" || form.telefone.value==="" || form.email.value==="" || form.dataNascimento.value==="") {
        alert("Todos os campos devem serem informados.")
        return
    }
    const data = {
        nome: form.nome.value,
        telefone: form.telefone.value,
        email: form.email.value,
        dataNascimento: form.dataNascimento.value,
        ativo: form.ativo.checked
    }

    if (document.querySelector("#bnt-enviar").name === "salvar") {
        insertContact(data, "PUT", document.querySelector("#id_contact").name )
    }

    else {
        insertContact(data,"POST", null)
    }

    close_modal.click()
}

function setDataTable(data){
    const { id, nome, telefone, dataNascimento, email, ativo } = data
    const toggle = ` 
    <div class="dropdown">
    ${ATIVO_TEXTO[ativo]} &nbsp <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
        </button>
        <ul class="dropdown-menu">
            <li><button class="dropdown-item" onclick="editContact(${id})">Editar</button></li>
            <li><button class="dropdown-item" onclick="deleteContact(${id})">Apagar</button></li>
        </ul>
    </div>`

    let tbody = document.querySelector("#tbody-c")
    let row = document.createElement("tr")

    let nome_cell = document.createElement("td")
    let telefone_cell = document.createElement("td")
    let dataNascimento_cell = document.createElement("td")
    let email_cell = document.createElement("td")
    let ativo_cell = document.createElement("td")

    nome_cell.textContent = nome
    telefone_cell.textContent = telefone
    email_cell.textContent = email
    dataNascimento_cell.textContent = formatarData(dataNascimento)
    ativo_cell.innerHTML = toggle
    
    row.appendChild(nome_cell)
    row.appendChild(telefone_cell)
    row.appendChild(email_cell)
    row.appendChild(dataNascimento_cell)
    row.appendChild(ativo_cell)
    
    tbody.appendChild(row)
}

async function getData() {
    clearTable()
    const contacts = await getContacts()
    contacts.forEach((data) =>{
        setDataTable(data)
    })
}

var modal = document.querySelector("#myModal")

var btn = document.querySelector("#myBtn")

btn.onclick = function() {
  modal.style.display = "block"

  let modaledit = document.querySelector(".modal-header")
  let modal_bnt = document.querySelector("#bnt-enviar")
  let modal_nome = document.querySelector("#nome")
  let modal_telefone = document.querySelector("#telefone")
  let modal_email = document.querySelector("#email")
  let modal_data_nascimento = document.querySelector("#data_nascimento")
  let modal_ativo = document.querySelector("#ativo")
  
  modal_bnt.name = "enviar"
  modaledit.textContent = "Novo Contato"
  
  modal_nome.value = ""
  modal_telefone.value = ""
  modal_email.value = ""
  modal_data_nascimento.date = ""
  modal_ativo.value = true
  modal_bnt.textContent = "Enviar"
}

let close_modal = document.querySelector("#close")

close_modal.onclick = function() {
    modal.style.display = 'none' // Hide the modal
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none"
  }
}

window.onload = function () {
    let bnt_enviar = document.querySelector("#bnt-enviar")
    let input_search = document.querySelector("#search")
    
    input_search.addEventListener("input", searchContact)
    bnt_enviar.addEventListener("click", newContact);

    getData()
}