
	window.onload = function() {
		/*
		 Bugs a resolver:
		 -Arrumar tratamento de erros
		
		 Considerações:
		 -Novas palavras no vetor adicionadas no vetor de palavras, devem ser todas em MAIÚSCULA.
		 -Terminar manual do jogo.
		 */

		// Variáveis Globais
		var canvas = document.getElementById('stage'), word = document
				.getElementById('word'), letters = document
				.getElementById('letters'), wordToGuess, wordLength, badGuesses, correctGuesses, isSet = 0; //Variável utilizada para saber se o botão de reconhecimento de voz está ativo ou nao

		//Inicia o Display do Jogo
		function init() {
			var helptext = $('#helptext');
			//Esconde a mensagem de loading e adiciona os eventos ao botao de help 
			$('#loading').hide();
			$('#help').click(function(e) {
				$('body').append('<div id="mask"></div>');
				helptext.show();
			});
			$('#close').click(function(e) {
				$('#mask').remove();
				helptext.hide();
			});
			try {
				var recognition = new webkitSpeechRecognition();
				var speechBtnObj = $('#speechBtn');

				//Mostra os botões de controle
				$('#play').css('display', 'inline-block').click(newGame);
				$('#clear').css('display', 'inline-block').click(resetScore);

				if (screen.width < 800) {
					$('#shake').css('display', 'inline'); //Alterar
					$('#shake_text').css('display', 'inline'); //Alterar

					//Instancia de Shake
					var myShakeEvent = new Shake({
						threshold : 15
					});

					//Inicia o evento
					myShakeEvent.start();

					//Função que é chamada quando o evento de shake ocorre, no caso chamamos a função newGame()
					function shakeEventDidOccur() {
						speechBtnSet(false);
						navigator.vibrate(300);
						newGame();
					}

					//adicionando um listener para o evento shake
					window.addEventListener('shake', shakeEventDidOccur, false);
				}

				///////// Parte voltada para reconhecimento de voz  /////////
				//Funções do botão de comando de voz
				function speechBtnSet(isOn) {
					if (isOn == true) {
						isSet = 1;
						recognition.start();
						speechBtnObj
								.attr(
										'src',
										'img/mic-on.gif');
					} else if (isOn == false) {
						isSet = 0;
						recognition.stop();
						speechBtnObj
								.attr('src',
										'img/mic-off.gif');
					}
				}

				//Atribuindo listener para o evento onclick do botão de speech
				speechBtnObj.click(function(e) {
					if (isSet == 0) {
						speechBtnSet(true);
					} else {
						speechBtnSet(false);
					}
				});

				// Setando atributos do objeto recognition
				recognition.continuous = false;
				recognition.interimResults = false;
				recognition.onend = function() {
					speechBtnSet(false);
				};
				recognition.onnomatch = function() {
					alert("Erro: Não foi possível identificar a letra.");
				};
				recognition.onerror = function() {
					alert("Erro: Por favor diga a palavra, ou verifique se seu microfone está habilitado.");
				};
				recognition.onresult = function(event) {
					letter = event.results[0][0].transcript.charAt(0);
					checkLetter(letter);
				};

				///////// Fim da parte voltada para reconhecimento de voz  /////////

				// Inicializa o placar e grava, caso não tenha sido feito antes
				if (localStorage.getItem('hangmanWin') == null) {
					localStorage.setItem('hangmanWin', '0');
				}
				if (localStorage.getItem('hangmanLose') == null) {
					localStorage.setItem('hangmanLose', '0');
				}
				showScore();
			} catch (e) {
				var browserCompativel = $('#naoCompativel');
				browserCompativel.show();
			}
		}

		//Função novo jogo, reseta as variáveis erros e acertos, escolhe uma nova palavra e cria as underlines no jogo
		function newGame() {
			var placeholders = ''; //Variável local que guarda as strings de underline.

			//Inicializando as variáveis globais.
			badGuesses = 0;
			correctGuesses = 0;
			wordToGuess = getWord(); //Atribuindo palavra aleatória
			wordLength = wordToGuess.length; //Tamanho da palavra aleatória para ser utilizada na formação das underlines que representam as letras.

			// Criando as underlines no jogo
			for (var i = 0; i < wordLength; i++) {
				placeholders += '_';
			}
			//Adicionando ao DOM as underlines
			word.innerHTML = placeholders;

			//Mostrando botão do speech
			$('#speechBtn').css("display", "inline-block");

			//Apagando palavras que foram tentadas
			letters.innerHTML = '';
			//Desenhando no canvas
			drawCanvas();
		}

		//Reseta placar
		function resetScore() {
			localStorage.setItem('hangmanWin', '0');
			localStorage.setItem('hangmanLose', '0');
			showScore();
		}

		// checa se a letra está na palavra a ser adivinhada
		function checkLetter(letter) {
			letter = letter.toUpperCase();
			var placeholders = word.innerHTML, wrongGuess = true;
			//da split na variavel placeholders, para transforma-lá em array
			placeholders = placeholders.split('');

			function verificaSeJaFoiFalado(letters) {
				letters = letters.toUpperCase();
				var lettersArray = letters.split('');
				var exists = false;
				for (var i = 0; i < lettersArray.length; i++) {
					if (lettersArray[i] == letter) {
						alert("Você já disse essa letra!");
						exists = true;
						break;
					}
				}
				return exists;
			}
			// varrendo a array
			if (verificaSeJaFoiFalado(word.innerHTML) == false) {
				for (var i = 0; i < wordLength; i++) {
					// if the selected letter matches one in the word to guess,
					// replace the underscore and increase the number of correct guesses
					if (letter == wordToGuess.charAt(i)) {
						placeholders[i] = letter.toLowerCase();
						wrongGuess = false;
						correctGuesses++;
						// redraw the canvas only if all letters have been guessed
						//if (correctGuesses == wordLength) {
						//	drawCanvas();
						//}
					}
				}
				// if the guess was incorrect, increment the number of bad
				// guesses and redraw the canvas
				if (wrongGuess) {
					var exists = verificaSeJaFoiFalado(letters.innerHTML);
					if (!exists) {
						badGuesses++;
						letters.innerHTML = letters.innerHTML + letter;
					}
				}
			}
			//converte a array para string e a mostra novamente
			word.innerHTML = placeholders.join('');
			//Desenha no canvas
			drawCanvas();

		}

		// desenha no canvas
		function drawCanvas() {
			function drawLine(context, from, to) {
				context.beginPath();
				context.moveTo(from[0], from[1]);
				context.lineTo(to[0], to[1]);
				context.stroke();
			}
			var c = canvas.getContext('2d');
			// reseta o canvas e seta os estilos basicos
			canvas.width = canvas.width;
			c.lineWidth = 10;
			c.strokeStyle = 'black';
			c.font = 'bold 24px Optimer, Arial, Helvetica, sans-serif';
			c.fillStyle = 'green';
			// desenha o chão 
			drawLine(c, [ 20, 190 ], [ 180, 190 ]);
			// começa desenhando a forca de acordo com os numeros de erros 
			if (badGuesses > 0) {
				// desenha a haste principal 
				c.strokeStyle = '#A52A2A';
				drawLine(c, [ 30, 185 ], [ 30, 10 ]);
				if (badGuesses > 1) {
					// desesenha a haste onde fica a corda
					c.lineTo(150, 10);
					c.stroke();
				}
				if (badGuesses > 2) {
					c.strokeStyle = 'black';
					c.lineWidth = 3;
					// desenha  a corda 
					drawLine(c, [ 145, 15 ], [ 145, 30 ]);
					// desenha a cabeça c.beginPath(); 
					c.moveTo(160, 45);
					c.arc(145, 45, 15, 0, (Math.PI / 180) * 360);
					c.stroke();
				}
				if (badGuesses > 3) {
					// desenha o corpo 
					drawLine(c, [ 145, 60 ], [ 145, 130 ]);
				}
				if (badGuesses > 4) {
					// desenha o braço esquerdo 
					drawLine(c, [ 145, 80 ], [ 110, 90 ]);
				}
				if (badGuesses > 5) {
					// desenha o braço direito 
					drawLine(c, [ 145, 80 ], [ 180, 90 ]);
				}
				if (badGuesses > 6) {
					// desenha a perna esquerda 
					drawLine(c, [ 145, 130 ], [ 130, 170 ]);
				}
				if (badGuesses > 7) {
					// desenha a perna direita e termina o jogo 
					drawLine(c, [ 145, 130 ], [ 160, 170 ]);
					c.fillText('Fim de Jogo!', 45, 110);
					// remove o pad do alfabeto 
					letters.innerHTML = '';
					// mostra a resposta certa 
					// é preciso usar a função seTimeout para dar tempo de mostrar o texto anterior 
					setTimeout(showResult, 200);
					// aumenta o placar de perdas 
					// mostra o placar apos 2 segundos 
					localStorage.setItem('hangmanLose',
							1 + parseInt(localStorage.getItem('hangmanLose')));
					$('#speechBtn').css("display", "none");
					setTimeout(showScore, 2000);
				}
			}
			// if the word has been guessed correctly, display message, 
			// update score of games won, and then show score after 2 seconds
			if (correctGuesses == wordLength) {
				letters.innerHTML = '';
				c.fillText('Você ganhou!', 45, 110);
				// increase score of won games 
				// display score 
				localStorage.setItem('hangmanWin', 1 + parseInt(localStorage
						.getItem('hangmanWin')));
				$('#speechBtn').css("display", "none");
				setTimeout(showScore, 2000);
			}
		}

		//Quando o jogo acaba, mostra as letras faltantes em vermelho
		function showResult() {
			var placeholders = word.innerHTML;
			placeholders = placeholders.split('');
			for (i = 0; i < wordLength; i++) {
				if (placeholders[i] == '_') {
					placeholders[i] = '<span style="color:red">'
							+ wordToGuess.charAt(i) + '</span>';
				}
			}
			word.innerHTML = placeholders.join('');
		}

		// Mostra o placar
		function showScore() {
			var won = localStorage.getItem('hangmanWin'), lost = localStorage
					.getItem('hangmanLose'), c = canvas.getContext('2d');
			// reseta o canvas 
			canvas.width = canvas.width;
			c.font = 'bold 24px Optimer, Arial, Helvetica, sans-serif';
			c.fillStyle = '#BD5C5C';
			c.textAlign = 'center';
			c.fillText('SEU PLACAR', 100, 50);
			c.font = 'bold 18px Optimer, Arial, Helvetica, sans-serif';
			c.fillText('Ganhou: ' + won + ' / Perdeu: ' + lost, 100, 80);
		}

		// Seleciona uma palavra aleatória de um vetor
		function getWord() {
			var a = new Array('PETROLEO', 'PESTANA', 'PESTILENTO', 'PETELECO',
					'REBOQUE', 'CADAFALSO', 'CADEIRA', 'COLA', 'REBENTO',
					'DEFUMADO', 'DISCURSO', 'ELETRODOMESTICO', 'ELETRONICA',
					'ENGRENAGEM', 'ESFOMEADO', 'FERRALHEIRO', 'FERROVIA',
					'FERTIL', 'FORTALEZA', 'FORTIFICANTE', 'OFICINA',
					'ORNAMENTO', 'PALAVRA', 'PREOCUPACAO', 'RADIOLOGIA',
					'RADIOGRAFIA', 'GRANJA', 'GRANULADO', 'INDUZIDO',
					'IMBATIVEL', 'INDUSTRIA', 'INTERNACIONAL', 'LABIRINTO',
					'LOBISOMEM', 'LOCOMOTIVA', 'TESOURA', 'MASSAGISTA',
					'MATADOURO', 'MOCHILA', 'NOROESTE', 'NITROGLICERINA',
					'HELICOPTERO', 'CAPITALISMO', 'SOFTWARE', 'ENGENHARIA',
					'NOROESTE', 'AUTENTICO', 'LINUX', 'PROCESSADOR',
					'QUARENTENA', 'MEDICINA', 'HOLOCAUSTO', 'RADIOGRAFIA',
					'XAROPE', 'ZAROLHO', 'ZOOLOGICO', 'HEREDITARIO', 'EXTASE',
					'EXTRAVIO', 'DUODENO', 'ECOLOGISTA', 'TURISMO',
					'TRAFICANTE', 'CONSELHO', 'BAIXISTA', 'AVESTRUZ',
					'QUIMICA', 'BOTANICA', 'RESPECTIVO', 'SAXOFONE', 'TABERNA',
					'OCULTO', 'TRIGONOMETRIA', 'ZODIACO', 'JUSTAPOSTO',
					'HIDRAULICO', 'HEXAGONO', 'MINEIRO', 'FRENETICO',
					'EXPLOSIVEL', 'EXORCISTA' ,'HAMBURGUE');
			return a[parseInt(Math.random() * a.length)]; //a Math.random() é um função do objeto JS que retorna um decimal entre 0 e próx de 1, multiplicamos pelo tamanho do vetor e utilizamos o parseInt para transformar em inteiro. 81 palavras.
		}
		//Fim da Função getWord()

		//Chamada da função init() que inicia o jogo
		init();
	}