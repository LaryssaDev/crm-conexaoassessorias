import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Lead } from '../types';
import { FileText, Download, Printer, CheckCircle2, Search, Calendar, MapPin, CreditCard, User as UserIcon } from 'lucide-react';
import { jsPDF } from 'jspdf';

export const Contrato: React.FC = () => {
  const { user } = useAuth();
  const { leads } = useData();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [contractInfo, setContractInfo] = useState({
    estadoCivil: '',
    endereco: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    credor: '',
    valor: '',
    parcelas: '',
    formaPagamento: '',
    dataContrato: new Date().toISOString().split('T')[0]
  });

  const getBase64ImageFromUrl = async (imageUrl: string) => {
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener("load", () => resolve(reader.result as string), false);
        reader.onerror = () => reject(new Error("Failed to load image"));
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error fetching image:", error);
      return null;
    }
  };

  const formatDateByExtension = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    const months = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    return `${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
  };
  const generatePDF = async () => {
    if (!selectedLead) return;
    setIsGenerating(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      
      const logoUrl = 'https://i.imgur.com/pcnXKBK.jpeg';
      const logoBase64 = await getBase64ImageFromUrl(logoUrl);
      
      const drawHeader = (doc: jsPDF, y: number) => {
        if (logoBase64) {
          const imgProps = doc.getImageProperties(logoBase64);
          const logoWidth = 40;
          const logoHeight = (imgProps.height * logoWidth) / imgProps.width;
          doc.addImage(logoBase64, 'JPEG', (pageWidth - logoWidth) / 2, y, logoWidth, logoHeight);
          return y + logoHeight + 10;
        }
        return y + 10;
      };

      const addNewPage = () => {
        doc.addPage();
        return drawHeader(doc, 10);
      };

      let currentY = drawHeader(doc, 10);

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('CONTRATO DE PRESTAÇÃO DE SERVIÇO', pageWidth / 2, currentY, { align: 'center' });
      currentY += 15;

      // Content
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
         const contractText = `Por este presente instrumento particular de prestação de serviços, as partes:

CONEXAO ASSESSORIA, regularmente inscrita no CNPJ sob o nº 37.423.637/0001-09, com sede social na R. Benjamin Pereira, 246 – Jaçanã, São Paulo – SP, 02274-000, doravante denominado CONTRATADO, e;

aaaaaaaaaaaaaaaaaaaaaaa, bbbbbbbbb, inscrito (a) no CPF sob o Nº XXX.XXX.XXX-XX residente e domiciliada yyyyyyyyyyyyy qq – llllllllllllllllllll gggggggggg- cc – CEP: pppppppppppp, doravante denominado CONTRATANTE;

Tem entre si pactuado um o presente contrato de prestação de serviços para INTERMEDIAÇÃO BANCÁRIA, mediante renegociação extrajudicial e/ou judicial em contratos de financiamentos, empréstimos e/ou arrendamento mercantil em nome do (a) CONTRATANTE face ao banco/financeira credor (a).

CLÁUSULA 1ª: O contrato a ser intermediado trata-se de financiamento com alienação fiduciária ao credor ffffffffffffff

PARAGRÁFO ÚNICO: ESTE CONTRATO TORNA-SE VÁLIDO NO ATO DE SUA ASSINATURA, ENTRANDO EM VIGÊNCIA SOMENTE MEDIANTE PAGAMENTO INTEGRAL DO SEU VALOR.

CLÁUSULA 2ª: Para prestar o serviço objeto deste contrato fica a CONTRATADA obrigada a:
a) Entrar em contato com os credores localizados para diligenciar, mediante a renegociação extrajudicial, a redução de juros e/ou taxas e tarifas cobradas em detrimento do (a) CONTRATANTE;
b) Apresentar ao CONTRATANTE as vantagens eventualmente obtidas através da citada renegociação extrajudicial;
c) Caso seja interesse do (a) CONTRATANTE, promover a implementação das medidas necessárias para quitação dos débitos verificados.

CLÁUSULA 3ª: O (a) CONTRATANTE declara estar ciente que o serviço objeto deste contrato é de meio, não podendo a CONTRATADA garantir êxito nas ações judiciais e extrajudiciais em favor do primeiro.

PARAGRÁFO ÚNICO: Toda e qualquer redução/vantagem obtida pela CONTRATADA em favor do (a) CONTRATANTE será notificado através do e-mail zzzzzzzzzzzzzzzzzzzzzz e telefone wwwwwwwwwwwwww respeitando as condições obtidas junto ao credor, bem como, indicando o prazo para que o (a) CONTRATANTE se manifeste sobre a intenção de acordo, sendo que no silêncio a CONTRATADA entenderá que o (a) CONTRATANTE declinou a proposta.

CLÁUSULA 4ª: Após receber a notificação referente quaisquer das renegociações o (a) CONTRATANTE poderá, dentro do prazo indicado, informar sua anuência com a proposta obtida, a CONTRATADA por sua vez promoverá a implementação das medidas necessárias para quitação do(s) débito(s), ocasião em que a CONTRATADA dará por encerrada a prestação de serviços aqui pactuada.

PARÁGRAFO ÚNICO: Uma vez confirmada à intenção de quitação do débito pelo (a) CONTRATANTE este deverá fazê-la dentro do prazo indicado pela CONTRATADA. Se a quitação não ocorrer no citado prazo o (a) CONTRATANTE desde já declara estar ciente de que a CONTRATADA não se responsabiliza pelo valor alcançado, e caso tenha decorrido o prazo descrito na cláusula 14ª a CONTRATADA também não terá a obrigação de continuar a renegociação.

CLÁUSULA 5ª: O (a) CONTRATANTE declara neste ato estar plenamente ciente de que não pode deixar de pagar as parcelas do contrato que celebrou com a instituição financeira e que se o fizer, por sua vontade, deverá manter uma reserva financeira para pagamento da proposta obtida pela CONTRATADA, ciente das medidas judiciais e extrajudiciais que o credor pode empregar para retomada do veículo ou cobrança do crédito.

PARÁGRAFO ÚNICO: O (a) CONTRATANTE declara ainda estar ciente de que se estiver ou vier a ficar inadimplente com relação aos pagamentos devidos à instituição financeira credora, a renegociação extrajudicial, ou mesmo eventual processo para revisão de juros e restituição de taxas, não impede que contra ele (a) seja movida ação de busca e apreensão/reintegração de posse/imissão na posse que porventura pode acarretar na perda do bem adquirido por meio do contrato bancário.

CLÁUSULA 6ª: No ato da assinatura deste contrato o (a) CONTRATANTE entrega a CONTRATADA declaração com informações imprescindíveis para a realização do serviço descrito na cláusula 1ª, tais como se já celebrou ou quebrou acordo referente ao(s) débito(s) que serão renegociados extrajudicialmente, etc.

PARÁGRAFO ÚNICO: O presente contrato será considerado rescindido, independentemente de notificação extrajudicial ou judicial, caso a CONTRATADA constate que o (a) CONTRATANTE prestou falsas informações na declaração descrita na cláusula anterior, arcando o (a) CONTRATANTE com os prejuízos decorrentes da prestação de declaração inverídica.

CLÁUSULA 7ª: O (a) CONTRATANTE se compromete neste ato a fornecer à CONTRATADA todos os documentos e informações que lhe forem solicitados para o desenvolvimento dos serviços previsto da cláusula 1º. As informações e documentos apresentados pelo (a) CONTRATANTE são de sua exclusiva responsabilidade, cabendo ao (a) CONTRATANTE a responsabilidade pelas referidas informações e documentos em qualquer esfera.

PARÁGRAFO ÚNICO: O (a) CONTRATANTE declara neste ato a ciência de que os serviços contratados somente serão prestados após o fornecimento LEGIVEL e SEM RASURAS de toda a documentação e informações previstas no caput.

CLÁUSULA 8ª: No ato da assinatura deste contrato a CONTRATADA fornecerá ao (a) CONTRATANTE procuração que deverá ser assinada com reconhecimento de firma POR AUTENTICIDADE pelo (a) CONTRATANTE no prazo de 15 (quinze) dias contados da assinatura deste termo, e entregue à CONTRATADA em sua sede ou por correios.

§ 1° O (a) CONTRATANTE reconhece que citada procuração é de suma importância para a prestação dos serviços descrito na cláusula 1º deste contrato, e que o não fornecimento do documento, ou o fornecimento em condições inviáveis para o uso impossibilitará a realização dos serviços sem culpa da CONTRATADA.

§ 2° A não entrega da procuração assinada ou a entrega em condições não adequadas, será notificada pela CONTRATADA e deverá ser corrigido em no máximo 03 (Três) dias. Caso não ocorra a correção a necessidade apontada, será o presente contrato extinto por culpa exclusiva do contratante, não fazendo ele jus a nenhum valor que tenha efetuado.

CLÁUSULA 9ª: O (a) CONTRATANTE se obriga neste ato a manter seus dados, tais como endereço residencial, telefone e e-mail sempre atualizados no cadastro de informações da CONTRATADA, eximindo-a de qualquer responsabilidade por fato decorrente de sua não localização caso os dados estejam desatualizados.

PARAGRAFO PRIMEIRO: Declara o (a) CONTRATANTE estar ciente que em caso de falta de contato pelo período igual ou maior há 90 (noventa) dias, por motivos desconhecidos ou não previamente informados, a CONTRATADA suspenderá o serviço pelo mesmo prazo. Decorrido 90 (noventa) dias de suspensão contratual sem que haja a manifestação do (a) CONTRATANTE, o contrato será cancelado pela CONTRATADA sem devolução do valor pago, não tendo o (a) CONTRATANTE direitos de reaver a quantia ou serviço.

PARÁGRAFO SEGUNDO: As informações sobre os serviços prestados pela CONTRATADA serão prestadas somente à pessoa do (a) CONTRATANTE, sendo que em caso de informações ao TERCEIRO INTERESSADO sobre os serviços prestados pela CONTRATADA somente serão disponibilizados mediante a indicação expressa do (a) CONTRATANTE com a apresentação dos dados para cadastro do TERCEIRO INTERESSADO. Se porventura o (a) CONTRATANTE quiser revogar a autorização de recebimento de informações a terceiros deverá comunicar expressamente a CONTRATADA desta intenção.

CLÁUSULA 10ª: As notificações descritas nas cláusulas 3ª e 4ª deste contrato serão feitas prioritariamente por e-mail, no endereço digital fornecido pelo (a) CONTRATANTE, sendo de sua inteira responsabilidade acompanhar seu correio eletrônico, isentando a CONTRATADA de qualquer responsabilidade por eventuais perdas de prazo decorrentes do não acompanhamento do e-mail.

CLÁUSULA 11ª: O (a) CONTRATANTE declara ciência de que as negociações serão realizadas exclusivamente pela CONTRATADA, sendo que sua intervenção junto aos seus credores poderá influenciar, em forma negativa nas estratégias negociais empregadas pela CONTRATADA. Neste sentido declara o (a) CONTRATANTE que se eventual prejuízo às negociações forem identificados por sua intervenção, ficará a CONTRATADA isenta de qualquer responsabilidade pelo atraso nos resultados, bem como, pelo insucesso da negociação outrora iniciada, visto pelo que se orienta a não interferir na negociação, respeitando até mesmo a natureza da contratação e obrigações da CONTRATADA constante neste contrato.

PARÁGRAFO PRIMEIRO: Se o (a) CONTRATANTE infringir o constante no caput desta cláusula, causando prejuízo às atividades da CONTRATADA no tocante às negociações, objeto do contrato, imagem e ou relacionamento com o credor, o presente contrato de prestação será rescindido, não tendo o (a) CONTRATANTE direito à restituição dos valores pagos a CONTRATADA devendo, ainda, o (a) CONTRATANTE arcar com multa equivalente a 30% (trinta por cento) do valor fixado a título de honorários pagos pela prestação de serviços deste contrato.

PARÁGRAFO SEGUNDO: Caso haja, por parte do CONTRATANTE, abertura de reclamação no órgão PROCON ou nos sites: google.com.br e/ou reclameaqui.com.br, durante a vigência do contrato celebrado, este será rescindido unilateralmente, sem a restituição de valores pagos anteriormente. Para tais manifestações a CONTRATADA disponibiliza de canal próprio para o serviço de atendimento ao consumidor (SAC) na clausula 18ª deste contrato.

CLÁUSULA 12ª: A título de honorários pela prestação dos serviços objeto deste contrato o (a) CONTRATANTE pagará a importância de R$XXXX,XX que serão pagos nas seguintes condições:
mmmmmmmmmmmmmmmm R$XXXX,XX (XX) XX/XX/XXXX

PARÁGRAFO PRIMEIRO: Caso tenha sido avençado entre as partes pagamento parcelado em boleto e/ou depósitos, transferências ou pix, a prestação de serviços só será iniciada após a quitação do valor integral estipulado e, em caso de inadimplência, o (a) CONTRATANTE arcará com juros de mora de 1% ao mês, multa de 2% sobre a parcela vencida e correção monetária, autorizando desde já que a CONTRATADA envie boleto bancário com o valor acrescido dos encargos da mora.

PARÁGRAFO SEGUNDO: Neste ato o (a) CONTRATANTE declara estar ciente de que é de sua responsabilidade o pagamento de custas e emolumentos, taxas, honorários para elaboração de laudos, honorários advocatícios, entre outros que se fizerem necessários para a prestação dos serviços contratados, as quais correrão por sua conta e sem que haja relação ao valor descrito no caput desta clausula. O (a) CONTRATANTE declara ainda ter ciência de que a CONTRATADA não antecipará os referidos pagamentos em hipótese alguma.

CLÁUSULA 13ª: O (a) CONTRATANTE declara estar ciente de que o prazo MÉDIO para realização do serviço e renegociações extrajudiciais é de 120 (Cento e vinte) dias úteis contados da efetiva entrega dos documentos constante da cláusula 7ª deste contrato.

PARÁGRAFO PRIMEIRO: Decorrido o prazo descrito no caput desta clausula, tendo a CONTRATADA apresentado propostas com 51% ou mais de redução sobre o montante devido, caso o (a) CONTRATANTE tenha rejeitado as propostas notificadas ou tenha se mantido silente quanto a elas, o presente contrato será rescindido imediatamente, pelo cumprimento das obrigações nele avençadas, independentemente de notificação judicial ou extrajudicial, não podendo o (a) CONTRATANTE nada reclamar a, e/ou sobre a, CONTRATADA.

PARÁGRAFO SEGUNDO: Ressalva-se que o prazo citado no Caput desta Cláusula refere- se apenas ao Processo Extrajudicial. Em caso da necessidade de Medidas Judiciais, havendo prazos determinados, estes serão mencionados em termo aditivo que, obrigatoriamente, antecederá qualquer processo judicial a ser proposto pela CONTRATADA.

CLÁUSULA 14ª: No caso de êxito na prestação de serviços e a efetiva reabilitação de crédito mediante o pagamento do saldo devedor ao credor, o prazo para baixa junto aos órgãos de proteção de crédito, se necessário, será de 30 (trinta) dias úteis contados do pagamento efetuado pelo (a) CONTRATANTE, sendo está uma OBRIGAÇÃO EXCLUSIVA DO CREDOR citado na clausula 1ª deste contrato.

CLÁUSULA 15ª: O (a) CONTRATANTE declara neste ato que tem plena ciência de que de forma alguma a CONTRATADA comprará ou pagará a(s) dívida(s) que serão objeto(s) de renegociação extrajudicial neste contrato, bem como que a responsabilidade sobre tal pagamento cabe somente ao (a) CONTRATANTE.

CLÁUSULA 16ª: O (a) CONTRATANTE declara estar ciente que só haverá devolução do valor pago à CONTRATADA para desenvolvimento do serviço constante neste contrato, se comprovado defeito na prestação de serviço da CONTRATADA. Portanto, neste caso CONTRATADA se compromete a restituir ao (a) CONTRATANTE os valores que este eventualmente tenha pagado a ela caso não haja a prestação dos serviços contratados nos termos da cláusula 1º deste contrato.

CLÁUSULA 17ª: Caso seja necessário o ingresso ou defesa em ação judicial, a CONTRATADA possui profissionais habilitados para este fim, devendo as partes assinar aditivo ao presente contrato para formalizar a questão.

PARAGRÁFO ÚNICO: Ficará eleito o foro do domicílio da CONTRATADA, para dirimir questões oriundas do presente contrato. CONEXAO ASSESSORIA, regularmente inscrita no CNPJ sob o nº 37.423.637/0001-09

CLÁUSULA 18ª: Todos e quaisquer contatos efetuados pela CONTRATADA ao (a) CONTRATANTE serão por meio dos números telefônicos 1194878-6367, por carta registrada, e/ou por e-mails com domínio @conexaoassessoria.com ou pelo SAC 1193208-8350 portanto deverá o (a) CONTRATANTE desconsiderar outros tipos de contatos e envios, não tendo a CONTRATADA responsabilidade por eventuais desconfortos e/ou prejuízos.

CLÁUSULA 19ª: O presente contrato tem validade a partir da assinatura das partes, entrando em Vigor na data em que se comprovar o recebimento integral dos valores acordados, conforme previsto no Parágrafo 1° da Cláusula 12ª do presente Contrato.

São Paulo, xx de xxxxxxxxxxx de 2026`;

      const finalContent = contractText
        .replace(/aaaaaaaaaaaaaaaaaaaaaaa/g, selectedLead.name)
        .replace(/bbbbbbbbb/g, contractInfo.estadoCivil)
        .replace(/XXX\.XXX\.XXX-XX/g, selectedLead.cpf)
        .replace(/yyyyyyyyyyyyy/g, contractInfo.endereco)
        .replace(/qq/g, contractInfo.numero)
        .replace(/llllllllllllllllllll/g, contractInfo.bairro)
        .replace(/gggggggggg/g, contractInfo.cidade)
        .replace(/cc/g, contractInfo.estado)
        .replace(/pppppppppppp/g, contractInfo.cep)
        .replace(/ffffffffffffff/g, contractInfo.credor)
        .replace(/zzzzzzzzzzzzzzzzzzzzzz/g, selectedLead.email)
        .replace(/wwwwwwwwwwwwww/g, selectedLead.phone)
        .replace(/R\$XXXX,XX/g, `R$ ${contractInfo.valor}`)
        .replace(/\(XX\)/g, `(${contractInfo.parcelas})`)
        .replace(/mmmmmmmmmmmmmmmm/g, contractInfo.formaPagamento)
        .replace(/XX\/XX\/XXXX/g, contractInfo.dataContrato.split('-').reverse().join('/'))
        .replace(/São Paulo, xx de xxxxxxxxxxx de 2026/g, `São Paulo, ${formatDateByExtension(contractInfo.dataContrato)}`);

      const paragraphs = finalContent.split('\n').filter(p => p.trim() !== '');
      const boldKeywords = [
        'CONEXAO ASSESSORIA', 'INTERMEDIAÇÃO BANCÁRIA', 'CLÁUSULA 1ª', 
        'PARAGRÁFO ÚNICO', 'CLÁUSULA 2ª', 'CLÁUSULA 3ª', 'CLÁUSULA 4ª', 
        'CLÁUSULA 5ª', 'CLÁUSULA 6ª', 'CLÁUSULA 7ª', 'CLÁUSULA 8ª', 
        'AUTENTICIDADE', 'impossibilitará', 'PARAGRAFO PRIMEIRO', 
        'PARÁGRAFO SEGUNDO', 'CLÁUSULA 10ª', 'CLÁUSULA 11ª', 'CLÁUSULA 12ª', 
        'CLÁUSULA 13ª', 'CLÁUSULA 14ª', 'CLÁUSULA 15ª', 'CLÁUSULA 16ª', 
        'CLÁUSULA 17ª', 'CLÁUSULA 18ª', 'CLÁUSULA 19ª',
        'CONTRATANTE', 'CONTRATADA',
        selectedLead.name,
        contractInfo.endereco,
        contractInfo.numero,
        contractInfo.bairro,
        contractInfo.cidade,
        contractInfo.estado,
        contractInfo.cep,
        contractInfo.credor
      ].filter(Boolean); // Remove any empty values

      const renderLine = (line: string, x: number, y: number, width: number, isLastLine: boolean) => {
        const words = line.split(' ');
        const isBold = new Array(words.length).fill(false);

        // Identify bold words (including multi-word phrases)
        for (let i = 0; i < words.length; i++) {
          for (const kw of boldKeywords) {
            const kwWords = kw.split(' ');
            let match = true;
            for (let j = 0; j < kwWords.length; j++) {
              if (!words[i + j]) {
                match = false;
                break;
              }
              const cleanWord = words[i + j].replace(/[.,:;()]/g, '');
              if (cleanWord !== kwWords[j] && words[i + j] !== kwWords[j]) {
                match = false;
                break;
              }
            }
            if (match) {
              for (let j = 0; j < kwWords.length; j++) {
                isBold[i + j] = true;
              }
            }
          }
        }

        if (words.length === 1 || isLastLine) {
          let currentX = x;
          words.forEach((word, index) => {
            doc.setFont('helvetica', isBold[index] ? 'bold' : 'normal');
            const text = word + (index < words.length - 1 ? ' ' : '');
            doc.text(text, currentX, y);
            currentX += doc.getTextWidth(text);
          });
          return;
        }

        let totalWordsWidth = 0;
        words.forEach((word, index) => {
          doc.setFont('helvetica', isBold[index] ? 'bold' : 'normal');
          totalWordsWidth += doc.getTextWidth(word);
        });

        const spacePerGap = (width - totalWordsWidth) / (words.length - 1);
        let currentX = x;
        words.forEach((word, index) => {
          doc.setFont('helvetica', isBold[index] ? 'bold' : 'normal');
          doc.text(word, currentX, y);
          currentX += doc.getTextWidth(word) + spacePerGap;
        });
      };

      paragraphs.forEach((paragraph) => {
        const lines = doc.splitTextToSize(paragraph, contentWidth);
        lines.forEach((line: string, index: number) => {
          if (currentY + 10 > pageHeight - 20) {
            currentY = addNewPage();
          }
          
          renderLine(line, margin, currentY, contentWidth, index === lines.length - 1);
          currentY += 7;
        });
        currentY += 7;
      });

      // Signatures
      if (currentY > pageHeight - 60) {
        currentY = addNewPage();
      } else {
        currentY += 20;
      }

      const signatureWidth = 90;
      const spacing = 2;
      
      // Client Signature
      doc.setFont('helvetica', 'normal');
      doc.text('------------------------------------------------------------', margin, currentY + 20);
      doc.text(selectedLead.name, margin, currentY + 25);
      
      // Company Signature
      const signatureUrl = 'https://i.imgur.com/BXMTe2D.jpeg';
      const signatureBase64 = await getBase64ImageFromUrl(signatureUrl);
      if (signatureBase64) {
        doc.addImage(signatureBase64, 'JPEG', margin + signatureWidth + spacing, currentY, 40, 20);
      }
      doc.text('-------------------------------------------------------------', margin + signatureWidth + spacing, currentY + 20);
      doc.text('CONEXAO ASSESSORIA LTDA', margin + signatureWidth + spacing, currentY + 25);

      doc.save(`Contrato_${selectedLead.name.replace(/\s/g, '_')}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Cabeçalho Profissional */}
      <div className="flex flex-col items-center pt-[40px] pb-[30px]">
        <div className="w-full max-w-[120px]">
          <img 
            src="https://i.imgur.com/pcnXKBK.jpeg" 
            alt="Logo Conexão Assessoria" 
            className="w-full h-auto block object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
        <h2 className="mt-[20px] text-2xl font-bold text-slate-800 text-center">
          CONTRATO DE PRESTAÇÃO DE SERVIÇO
        </h2>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <FileText size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Gerador de Contratos</h3>
            <p className="text-sm text-slate-500">Gere contratos profissionais em PDF automaticamente</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Selecione o Cliente</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select 
                onChange={(e) => setSelectedLead(leads.find(l => l.id === e.target.value) || null)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
              >
                <option value="">Selecione um cliente da lista...</option>
                {leads.filter(l => l.status === 'Fechado' || l.status === 'Em Negociação').map(lead => (
                  <option key={lead.id} value={lead.id}>{lead.name} - {lead.cpf}</option>
                ))}
              </select>
            </div>
          </div>

          {selectedLead && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <UserIcon size={18} className="text-primary" />
                  Informações Adicionais do Contrato
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Estado Civil</label>
                    <input 
                      type="text"
                      value={contractInfo.estadoCivil}
                      onChange={(e) => setContractInfo({...contractInfo, estadoCivil: e.target.value})}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="Ex: Solteiro(a)"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Endereço</label>
                    <input 
                      type="text"
                      value={contractInfo.endereco}
                      onChange={(e) => setContractInfo({...contractInfo, endereco: e.target.value})}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="Rua, Avenida..."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Número</label>
                    <input 
                      type="text"
                      value={contractInfo.numero}
                      onChange={(e) => setContractInfo({...contractInfo, numero: e.target.value})}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="123"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Bairro</label>
                    <input 
                      type="text"
                      value={contractInfo.bairro}
                      onChange={(e) => setContractInfo({...contractInfo, bairro: e.target.value})}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="Centro"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Cidade</label>
                    <input 
                      type="text"
                      value={contractInfo.cidade}
                      onChange={(e) => setContractInfo({...contractInfo, cidade: e.target.value})}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="São Paulo"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Estado (UF)</label>
                    <input 
                      type="text"
                      value={contractInfo.estado}
                      onChange={(e) => setContractInfo({...contractInfo, estado: e.target.value})}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="SP"
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">CEP</label>
                    <input 
                      type="text"
                      value={contractInfo.cep}
                      onChange={(e) => setContractInfo({...contractInfo, cep: e.target.value})}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="00000-000"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Credor</label>
                    <input 
                      type="text"
                      value={contractInfo.credor}
                      onChange={(e) => setContractInfo({...contractInfo, credor: e.target.value})}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="Banco Itaú, Bradesco..."
                    />
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Valor do Contrato</label>
                    <input 
                      type="text"
                      value={contractInfo.valor}
                      onChange={(e) => setContractInfo({...contractInfo, valor: e.target.value})}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="2.500,00"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Parcelas</label>
                    <input 
                      type="text"
                      value={contractInfo.parcelas}
                      onChange={(e) => setContractInfo({...contractInfo, parcelas: e.target.value})}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="12x"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Forma de Pagamento</label>
                    <input 
                      type="text"
                      value={contractInfo.formaPagamento}
                      onChange={(e) => setContractInfo({...contractInfo, formaPagamento: e.target.value})}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="Cartão, Boleto, PIX"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Data do Contrato</label>
                    <input 
                      type="date"
                      value={contractInfo.dataContrato}
                      onChange={(e) => setContractInfo({...contractInfo, dataContrato: e.target.value})}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={generatePDF}
                  disabled={isGenerating}
                  className="flex-1 flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  <Download size={20} />
                  {isGenerating ? 'Gerando Documento...' : 'Gerar Contrato PDF'}
                </button>
                <button className="flex items-center justify-center gap-2 px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all">
                  <Printer size={20} />
                  Imprimir
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
        <div className="flex gap-4">
          <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
            <FileText size={20} />
          </div>
          <div>
            <h4 className="font-bold text-amber-800">Aviso Importante</h4>
            <p className="text-sm text-amber-700 leading-relaxed mt-1">
              O texto jurídico deste contrato é padronizado e não deve ser alterado sem autorização do departamento jurídico. 
              Certifique-se de que todos os dados do cliente estão corretos antes de gerar o documento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
