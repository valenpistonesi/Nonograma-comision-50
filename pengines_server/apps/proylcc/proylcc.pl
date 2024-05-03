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
	
	nth0(RowN, NewGrid, ListaCaracteresFila),
	checkeoSatShell(ListaCaracteresFila,RowsClues,FilaSat),

	columnaALista(ColN, NewGrid, C),
	reverse(C,ListaCaracteresColumna),
	checkeoSatShell(ListaCaracteresColumna,ColsClues, ColSat).
	
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


headTail([He],H,T):-
	H = He,
	T =[].

headTail(Lista,H,T):-
	[H|T] =Lista.

checkeoSat("#",[],1,[],_). 

checkeoSat(C,[],0,[],_):-
	C\="#".


checkeoSat("#",ListaCaracteres,Pista,ListaPistas,_):- 
	length(ListaCaracteres,Largo),
	Largo>0,
	[H|T] = ListaCaracteres,
	Pista > 0,
	Xpista is Pista-1,
	checkeoSat(H,T,Xpista,ListaPistas,1).

checkeoSat(C,ListaCaracteres,0,ListaPistas,1):-
	C\="#",
	length(ListaCaracteres,Largo),
	Largo>0,
	[H|T] = ListaCaracteres,
	headTail(ListaPistas,H2,T2),
	checkeoSat(H,T,H2,T2,0).

checkeoSat(C,ListaCaracteres,Pista,ListaPistas,0):-
	C\="#",
	length(ListaCaracteres,Largo),
	Largo>0,
	[H|T] = ListaCaracteres,
	checkeoSat(H,T,Pista,ListaPistas,0).

columnaALista(C,[H],Resultado):-
	nth0(C,H,Cont),
	append([],[Cont],Resultado).

columnaALista(C,Grilla,Resultado):-
	[H|T] = Grilla,
	nth0(C,H,Cont),
	columnaALista(C,T,R),
	append(R,[Cont],Resultado).