let app = require("../src/app");
let supertest = require("supertest");
let request = supertest(app);

let mainUser ={name: "Alexandre", email: "ale@gmail.com", password: "123456"}

beforeAll(() => {
    return request.post("/user").send(mainUser).then(res => {

    }).catch(err => {console.log(err)})
})//irá exucutar primeiro 

afterAll(() => {
    return request.delete(`/user/${mainUser.email}`).then(res => {}).catch(err => {console.log(err)})
})//irá executar por ultimo





describe("Cadastro de usuario", () =>{
    test("Deve cadastrar um usuario com sucesso",() => {
        let time = Date.now;
        let email = `${time}@gmail.com`;
        let user = {name: "Ale", email, password: "123456"};

        return request.post("/user")
        .send(user).then(res => {
            expect(res.status).toEqual(200);
            expect(res.body.email).toEqual(email);
        }).catch(err => {
            console.log(err);
        })
    })

    test("Deve impedir que um usuario se cadastre com os dados vazios",() =>{
        let user = {name: "", email: "", password: ""};
        return request.post("/user")
        .send(user).then(res => {
            expect(res.status).toEqual(400);
            expect(res.body.email).toEqual(email);
        }).catch(err => {
            console.log(err);
        })
    })

    test("Deve impedir que um usuário se cadastro com email repitido", () => {

        let time = Date.now;
        let email = `${time}@gmail.com`;
        let user = {name: "Ale", email, password: "123456"};

        return request.post("/user")
        .send(user).then(res => {
            expect(res.status).toEqual(200);
            expect(res.body.email).toEqual(email);
            return request.post("/user").send(user).then(res => {
                expect(res.statusCode).toEqual(400);
                expect(res.body.error).toEqual("E-mail já cadastrado");
            }).catch(err => {
                console.log(err);
            })
        }).catch(err => {
            console.log(err);
        })

    });

    
});

describe("Autenticação",() => {
   test("Deve me retornar um token quando logar", ()=> {
    return request.post("/auth").send({email: mainUser.email, password: mainUser.password}).then(res => {
        expect(res.status).toEqual(200);
        expect(res.body.token).toBeDefined();
    }).catch(err => {
        console.log(err);
    })
   })
   
   test("Deve impedir que um usuario não cadastrado se logue",()=>{
    return request.post("/auth").send({email: "teste@teste.com", password: "151151515"}).then(res => {
        expect(res.status).toEqual(403);
        expect(res.body.errors.email).toEqual("E-mail não cadastrado");
    }).catch(err => {
        console.log(err);
    })
   })

   test("Deve impedir que um usuario se logue com a senha errada",()=>{
    return request.post("/auth").send({email: mainUser.email, password: "senhaErrada"}).then(res => {
        expect(res.status).toEqual(403);
        expect(res.body.errors.email).toEqual("Senha incorreta");
    }).catch(err => {
        console.log(err);
    })
   })

});