
import { DocumentTemplate } from '../types';

export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'procuracao-ad-judicia',
    title: 'Procuração Ad Judicia',
    description: 'Instrumento de mandato padrão para atuação judicial.',
    content: `
      <div style="font-family: 'Times New Roman', serif; line-height: 1.6;">
        <h2 style="text-align: center; text-transform: uppercase; font-weight: bold; margin-bottom: 2rem;">PROCURAÇÃO AD JUDICIA</h2>
        
        <p style="text-align: justify; margin-bottom: 1.5rem;">
          <strong>OUTORGANTE:</strong> <strong>{CLIENTE_NOME}</strong>, inscrito(a) no CPF/CNPJ sob o nº {CLIENTE_DOC}, 
          com endereço em {CLIENTE_ENDERECO}, telefone {CLIENTE_FONE}, e-mail {CLIENTE_EMAIL}.
        </p>

        <p style="text-align: justify; margin-bottom: 1.5rem;">
          <strong>OUTORGADO:</strong> <strong>{ADVOGADO_NOME}</strong>, advogado(a), inscrito(a) na OAB/{ADVOGADO_UF} sob o nº {ADVOGADO_OAB}, 
          com escritório profissional situado à {ESCRITORIO_ENDERECO}, onde recebe intimações e notificações.
        </p>

        <p style="text-align: justify; margin-bottom: 1.5rem;">
          <strong>PODERES:</strong> Pelo presente instrumento particular de mandato, o(a) OUTORGANTE nomeia e constitui o(a) OUTORGADO(A) como seu(sua) bastante procurador(a), 
          conferindo-lhe os poderes da cláusula <em>ad judicia et extra</em> para o foro em geral, podendo propor contra quem de direito as ações competentes e defendê-lo(a) nas contrárias, 
          seguindo umas e outras, até final decisão, usando os recursos legais e acompanhando-os, conferindo-lhe, ainda, poderes especiais para confessar, desistir, transigir, firmar compromissos ou acordos, 
          receber e dar quitação, agindo em conjunto ou separadamente, podendo ainda substabelecer esta em outrem, com ou sem reservas de iguais poderes, para o fiel cumprimento deste mandato.
        </p>

        <p style="text-align: justify; margin-bottom: 3rem;">
          <strong>FINALIDADE ESPECÍFICA:</strong> Atuar na defesa dos interesses do(a) OUTORGANTE perante qualquer Juízo, Instância ou Tribunal.
        </p>

        <p style="text-align: center; margin-bottom: 4rem;">
          {CIDADE_DATA}.
        </p>

        <div style="text-align: center; border-top: 1px solid #000; width: 60%; margin: 0 auto; padding-top: 0.5rem;">
          <strong>{CLIENTE_NOME}</strong><br>
          Outorgante
        </div>
      </div>
    `
  },
  {
    id: 'declaracao-hipossuficiencia',
    title: 'Declaração de Hipossuficiência',
    description: 'Para requerimento de Justiça Gratuita.',
    content: `
      <div style="font-family: 'Times New Roman', serif; line-height: 1.6;">
        <h2 style="text-align: center; text-transform: uppercase; font-weight: bold; margin-bottom: 2rem;">DECLARAÇÃO DE HIPOSSUFICIÊNCIA</h2>
        
        <p style="text-align: justify; margin-bottom: 2rem;">
          Eu, <strong>{CLIENTE_NOME}</strong>, inscrito(a) no CPF sob o nº {CLIENTE_DOC}, residente e domiciliado(a) em {CLIENTE_ENDERECO}, 
          <strong>DECLARO</strong>, para os devidos fins e sob as penas da lei, ser pobre na acepção jurídica do termo, não dispondo de condições financeiras para arcar com as custas processuais e honorários advocatícios sem prejuízo do meu próprio sustento e de minha família.
        </p>
        
        <p style="text-align: justify; margin-bottom: 3rem;">
          Por ser expressão da verdade, firmo a presente para que surta seus efeitos legais, requerendo, desde já, a concessão dos benefícios da <strong>JUSTIÇA GRATUITA</strong>, nos termos do art. 98 e seguintes do Código de Processo Civil e da Lei nº 1.060/50.
        </p>

        <p style="text-align: center; margin-bottom: 4rem;">
          {CIDADE_DATA}.
        </p>

        <div style="text-align: center; border-top: 1px solid #000; width: 60%; margin: 0 auto; padding-top: 0.5rem;">
          <strong>{CLIENTE_NOME}</strong><br>
          Declarante
        </div>
      </div>
    `
  },
  {
    id: 'substabelecimento',
    title: 'Substabelecimento',
    description: 'Transferência de poderes a outro advogado.',
    content: `
      <div style="font-family: 'Times New Roman', serif; line-height: 1.6;">
        <h2 style="text-align: center; text-transform: uppercase; font-weight: bold; margin-bottom: 2rem;">SUBSTABELECIMENTO</h2>
        
        <p style="text-align: justify; margin-bottom: 2rem;">
          Pelo presente instrumento, <strong>SUBSTABELEÇO</strong>, {TIPO_RESERVA}, na pessoa do(a) Dr(a). <strong>{SUBSTABELECIDO_NOME}</strong>, inscrito(a) na OAB/{SUBSTABELECIDO_UF} sob o nº {SUBSTABELECIDO_OAB}, 
          os poderes que me foram conferidos por <strong>{CLIENTE_NOME}</strong>, nos autos do processo nº {PROCESSO_NUMERO}, em trâmite perante a {PROCESSO_VARA}.
        </p>

        <p style="text-align: center; margin-bottom: 4rem;">
          {CIDADE_DATA}.
        </p>

        <div style="text-align: center; border-top: 1px solid #000; width: 60%; margin: 0 auto; padding-top: 0.5rem;">
          <strong>{ADVOGADO_NOME}</strong><br>
          OAB/{ADVOGADO_UF} {ADVOGADO_OAB}
        </div>
      </div>
    `
  }
];
