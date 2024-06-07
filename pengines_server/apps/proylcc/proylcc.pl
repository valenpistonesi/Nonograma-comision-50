:- module(proylcc,
	[  
		put/8
	]).

:-use_module(library(lists)).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
% replace(?X, +XIndex, +Y, +Xs, -XsY)
%
% XsY is the result of replacing the occurrence of X in position XIndex of Xs by Y.

replace(X, 0, Y, [X|Xs], [Y|Xs]).

replace(X, XIndex, Y, [Xi|Xs], [Xi|XsY]):-
    XIndex > 0,
    XIndexS is XIndex - 1,
    replace(X, XIndexS, Y, Xs, XsY).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
% put(+Content, +Pos, +RowsClues, +ColsClues, +Grid, -NewGrid, -RowSat, -ColSat).
%



put(Content, [RowN, ColN], RowsClues, ColsClues, Grid, NewGrid, FilaSat, ColSat):-
	% NewGrid is the result of replacing the row Row in position RowN of Grid by a new row NewRow (not yet instantiated).
	replace(Row, RowN, NewRow, Grid, NewGrid),

	% NewRow is the result of replacing the cell Cell in position ColN of Row by _,
	% if Cell matches Content (Cell is instantiated in the call to replace/5).	
	% Otherwise (;)
	% NewRow is the result of replacing the cell in position ColN of Row by Content (no matter its content: _Cell).			
	(replace(Cell, ColN, _, Row, NewRow) , Cell == Content; replace(_Cell, ColN, Content, Row, NewRow)),
	
	nth0(RowN,RowsClues, FilaClues),
	nth0(RowN, NewGrid, ListaCaracteresFila),
    adaptarLista(ListaCaracteresFila, ListaCar),
	checkeoSatShell(ListaCar,FilaClues,FilaSat),

	nth0(ColN,ColsClues, ColumnaClues),
	columnaALista(ColN, NewGrid, C),
	reverse(C,ListaCaracteresColumna),
    adaptarLista(ListaCaracteresColumna, ListaCol),
	checkeoSatShell(ListaCol,ColumnaClues, ColSat).
	
checkeoSatShell(ListaCaracteres, ListaPistas,Resultado):-
	headTail(ListaCaracteres,H1,T1),
	headTail(ListaPistas,H2,T2),
	decidirResultado(H1,T1,H2,T2,Resultado).

decidirResultado(H1,T1,H2,T2,Resultado):-
	checkeoSat(H1,T1,H2,T2,_),
	Resultado is 1.

decidirResultado(H1,T1,H2,T2,Resultado):-
	\+checkeoSat(H1,T1,H2,T2,_),
	Resultado is 0.

headTail([],H,T):-
	H = 0,
	T = [].

headTail([He],H,T):-
	H = He,
	T =[].

headTail(Lista,H,T):-
	[H|T] =Lista.

checkeoSat("#",[],1,[],_). 

checkeoSat(C,[],0,[],_):-	
    C="X";
    C="".


checkeoSat("#",ListaCaracteres,Pista,ListaPistas,_):- 
	length(ListaCaracteres,Largo),
	Largo>0,
	[H|T] = ListaCaracteres,
	Pista > 0,
	Xpista is Pista-1,
	checkeoSat(H,T,Xpista,ListaPistas,1).

checkeoSat(_,ListaCaracteres,0,ListaPistas,1):-
	length(ListaCaracteres,Largo),
	Largo>0,
	[H|T] = ListaCaracteres,
	headTail(ListaPistas,H2,T2),
	checkeoSat(H,T,H2,T2,0).

checkeoSat(_,ListaCaracteres,Pista,ListaPistas,0):-
	length(ListaCaracteres,Largo),
	Largo>0,
	[H|T] = ListaCaracteres,
	checkeoSat(H,T,Pista,ListaPistas,0).

/* RECIBE UN NUMERO C, UNA GRILLA Y UNA VARIABLE A DEVOLVER, RETORNA LA LISTA EN REVERSA*/
columnaALista(C,[H],Resultado):-
	nth0(C,H,Cont),
	append([],[Cont],Resultado).

columnaALista(C,Grilla,Resultado):-
	[H|T] = Grilla,
	nth0(C,H,Cont),
	columnaALista(C,T,R),
	append(R,[Cont],Resultado).

% el caso mas general es con X, 

adaptarLista([], []). 
adaptarLista([""|Xs], [""|Ys]) :- 
    adaptarLista(Xs, Ys).
adaptarLista(["X"|Xs], ["X"|Ys]) :- 
    adaptarLista(Xs, Ys).
adaptarLista(["#"|Xs], ["#"|Ys]) :- 
    adaptarLista(Xs, Ys).


mostrarSolucion(Grid,PFil,PCol):-
    resolverFilas(Grid,PFil),
    resolverColumnas(Grid,PCol,0).

resolverColumnas(G,[Pistas],C):-
    columnaALista(C,G,L),
    reverse(L,Lista),
    headTail(Lista,Cont,ListaRes),
    headTail(Pistas,PistaActual,PistasRes),
    checkeoSat(Cont,ListaRes,PistaActual,PistasRes,_).
    

resolverColumnas(G,PC,C):-
    columnaALista(C,G,F),
    reverse(F,Lista),
    headTail(Lista,Cont,ListaRes),
    
    headTail(PC,Pistas,ArrayListasPistas),
    headTail(Pistas,PistaActual,PistasRes),
    
    checkeoSat(Cont,ListaRes,PistaActual,PistasRes,_),
    CAux is C+1,
    resolverColumnas(G,ArrayListasPistas,CAux).

resolverFilas([Fila],[Pistas]):-
    headTail(Fila,Cont,FilaRes),
    headTail(Pistas,PistaActual,PistasRes),
    checkeoSat(Cont,FilaRes,PistaActual,PistasRes,_).
    

resolverFilas(G,PF):-
    headTail(G,Fila,Grilla), 
    headTail(Fila,Cont,FilaRes),
    
    headTail(PF,Pistas,ArrayListasPistas),
    headTail(Pistas,PistaActual,PistasRes),
    
    checkeoSat(Cont,FilaRes,PistaActual,PistasRes,_),
    
    resolverFilas(Grilla,ArrayListasPistas).
    