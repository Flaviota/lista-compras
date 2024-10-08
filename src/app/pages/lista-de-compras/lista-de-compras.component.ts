import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Produto } from 'src/app/models/produto.class';
import { SalvarListaComponent } from 'src/app/components/salvar-lista/salvar-lista.component';
import { ProdutoService } from 'src/app/services/produto.service';
import { JanelaModalComponent } from 'src/app/components/janela-modal/janela-modal.component';
import { AngularFireDatabase, AngularFireObject } from '@angular/fire/compat/database';



@Component({
  selector: 'app-lista-de-compras',
  templateUrl: './lista-de-compras.component.html',
  styleUrls: ['./lista-de-compras.component.css']
})
export class ListaDeComprasComponent implements OnInit {
  listaProdutos: Array<Produto> = []
  rotaAtual!: string
  nomeLista!: string  
  fireObject!: AngularFireObject<unknown>;
  
  constructor(private dialog: MatDialog,
    private router: Router,
    private produtoService: ProdutoService,
    private fireDB: AngularFireDatabase) { 
      
    }
    
    ngOnInit(): void {
      this.rotaAtual = this.router.url //
      this.nomeLista = this.rotaAtual.split("/").slice(-1)[0].replace("%20", ' ') // Caso haja espaço no nome da lista, na URL ele é trocado por %20, o que impediria a consulta no banco de dados

      this.produtoService.retornarLista(this.nomeLista).subscribe({ 
        next: lista => {
          for(let p in lista){
            this.listaProdutos.push(lista[p])

          } //end for
            
        } // end next
    }) // end subs
  } // end OnInit
  
  // fireObject: AngularFireObject<any>:
  

  // Retorna um array [texto do titulo, se deve aparecer os inputs]
  // Se for pagina Modo Mercado, os campos inputs não aparecerão 
  verificarPaginaAtual(url: string) { 
    let pagina = url.split('/')[1]
    let mostrarInputs = true
    switch(pagina){
      case 'modoMercado':{
        mostrarInputs = false
        return [`Modo Mercado: ${this.nomeLista}` , mostrarInputs]
      }
      case 'novaLista':{
        return [`Criar nova lista `, mostrarInputs]
      }
      case 'editarLista':{
        return [`Edição: ${this.nomeLista}` , mostrarInputs]
      }
      default:{
        return [false]
      }

    }

  }
  
  adicionarProduto(inputNome: HTMLInputElement, inputPreco: HTMLInputElement, inputQuantidade: HTMLInputElement) {
    let nome = inputNome.value.trim(); // Remover espaços extras
    let preco = Number(inputPreco.value);
    let quantidade = Number(inputQuantidade.value);
  
    // Validação dos campos
    if (!nome) {
      alert('O nome do produto não pode estar vazio!'); // Exibe um alerta ou pode ser um SnackBar
      inputNome.focus();
      return;
    }
  
    if (isNaN(preco) || preco <= 0) {
      alert('O preço deve ser um número válido e maior que zero!'); 
      inputPreco.focus();
      return;
    }
  
    if (isNaN(quantidade) || quantidade <= 0) {
      alert('A quantidade deve ser um número válido e maior que zero!');
      inputQuantidade.focus();
      return;
    }
  
    // Cria o objeto Produto e adiciona à lista
    let produto = new Produto(nome, preco, quantidade);
    this.listaProdutos.push(produto);
  
    // Limpa os campos e foca no campo nome
    inputNome.value = '';
    inputPreco.value = '';
    inputQuantidade.value = '';
    inputNome.focus();
  }  // end addProduto


  salvarLista(): void{  
    this.abrirDialogSalvar()
  }

  cancelar(){
    this.router.navigateByUrl('/')
  }

  // Abrir janela para Salvar Lista
  abrirDialogSalvar(): void {
    const dialogRef = this.dialog.open(SalvarListaComponent, {
      width: '300px',
      data: {nomeLista: this.nomeLista, lista: this.listaProdutos},
      disableClose: true,
      autoFocus: true,
      hasBackdrop: true
    });

    dialogRef.afterClosed().subscribe(result => {

      // this.animal = result;
    });
  }

  removerProduto(novaLista: Produto[]){ // recebe a lista da tabelaComponent com os produtos já removidos
    this.listaProdutos = novaLista // Apenas atribui a lista da tabelaComponent a lista deste component
  }

  removerTodosProdutos(){
    this.listaProdutos = []
  }

  abrirDialogRemoverTodos(){
    const dialogRef = this.dialog.open(JanelaModalComponent,{
      width: '350px',
      data: {mensagem: "Tem certeza que deseja remover todos os produtos?"},
      disableClose: false,
      hasBackdrop: true
    })
    this.eventoConfirmarRemocao(dialogRef)
  }

  eventoConfirmarRemocao(dialogRef: MatDialogRef<JanelaModalComponent>){
    dialogRef.componentInstance.eventConfirmar.subscribe(() =>{
      this.removerTodosProdutos()
      dialogRef.close()
    })
  }
  

}

