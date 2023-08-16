//Utilizamos la libreria crypto-js para realizar el calculo del HASH de los parametros que indiquemos en el constructor del block.
const SHA256 = require('crypto-js/sha256')

//Añadimos una nueva clase para añadir transacciones en lugar del data.
class Transaction {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }
}

//Primero de todo creamos nuestro bloque
class Block {
    //Hacemos un constructor con las variables que comportan el bloque.
    //**Cambiamos data por transactions */
    constructor(timestamp, transactions, previousHash = '') {
        //Tiempo de la transacción
        this.timestamp = timestamp;
        //Datos del bloque como pueden ser dirección de las wallets, cantidad de crypto...
        this.transactions = transactions;
        //El Hash del anterior bloque.
        this.previousHash = previousHash;
        //Hash del actual bloque
        this.hash = this.calculateHash();
        //Añadimos Nonce a nuestro constructor **
        this.nonce = 0;
    }

    //Añadimos el nonce al calculo del hash
    calculateHash() {
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
    }

    //Implementación proof of work con la función de minado del bloque.
    mineBlock(difficulty) {
        //Mientas no se cumpla la dificultad (en función de la dificultad indicada) estará realizando el calculo del hash.
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log("Block mined: " + this.hash);
    }
}

//Creamos nuestra blockchain
class Blockchain {

    constructor() {
        this.chain = [this.createGenesisBlock()];
        //***Añadimos la variable de dificultad de minado del bloque en nuestro constructor.
        this.difficulty = 4;
        //Añadimos a nuestro constructor un array de transacciones pendientes.
        this.pendingTransactions = [];
        //Tambien añadimos un recompensa por el minado del bloque.
        this.miningReward = 500;
    }

    //Función para crear nuestro Bloque Genesis. Se llama bloque genesis al primer bloque de cada blockchain.
    createGenesisBlock() {
        return new Block(0, "01/01/2022", "Genesis Block", "0");
    }

    //Función para obtener el anterior bloque
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    //Quitamos el AddBlock y lo cambiamos por la funcion de minado de transacciones pendientes, que la llamamos...miningPendingTransactions.
    minedPendingTransactions(miningRewardAddress) {
        //Definimos la creacion de un nuevo bloque.
        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        //Le pasamos la dificultad al minado del bloque.
        block.mineBlock(this.difficulty);

        //Añadimos el bloque a la cadena
        console.log('Bloque se ha minado correctamente');
        this.chain.push(block);

        //Cuando se ha minado la transaccion se crea otra transaccion para enviar el reward(premio) a la wallet del minero.
        this.pendingTransactions = [
            new Transaction(null, miningRewardAddress, this.miningReward)
        ];
    }

    //Función para crear una transacción.
    createTransaction(transaction) {
        this.pendingTransactions.push(transaction);
    }

    //Función para obtener el balance de una dirección.
    getBalanceOfAddress(address) {
        let balance = 0;

        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.fromAddress === address) {
                    balance -= trans.amount;
                }
                if (trans.toAddress === address) {
                    balance += trans.amount;
                }
            }
        }
        return balance;
    }

    //Función para comprobar si nuestra blockchain es valida.
    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }
}

//Definimos el nombre de nuestra Blockchain
let JJACoin = new Blockchain();

//Creamos nuevas transacciones de envio de dinero a diferentes wallets para luego comenzar el minado de los bloques de cada transaccion.
JJACoin.createTransaction(new Transaction('Address 1', 'Address 2', 50));
JJACoin.createTransaction(new Transaction('Address 2', 'Address 3', 450));

//Comenzar el minado.
console.log('\n Comenzando el minado....')
JJACoin.minedPendingTransactions('Ariana-Address');
//Obtener el balance del minero.
console.log('\nEl Balance de Ariana es', JJACoin.getBalanceOfAddress('Ariana-Address'));

//Minamos otro bloque para obtener la recompensa del minado que hemos establecido a partir del segundo bloque.
console.log('\n Comenzando el minado otra vez....')
JJACoin.minedPendingTransactions('Ariana-Address');

//Obtener el balance final.
console.log('\nEl Balance de Ariana es', JJACoin.getBalanceOfAddress('Ariana-Address'));
