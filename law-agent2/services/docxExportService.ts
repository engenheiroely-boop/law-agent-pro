import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer, PageBreak } from 'docx';
import { saveAs } from 'file-saver';

/**
 * Converte HTML para estrutura DOCX e faz download
 */
export const exportToDocx = async (htmlContent: string, fileName: string = 'documento') => {
    // Parser simples de HTML para DOCX
    const paragraphs = parseHtmlToParagraphs(htmlContent);

    const doc = new Document({
        sections: [{
            properties: {
                page: {
                    margin: {
                        top: 1440, // 1 inch = 1440 twips
                        right: 1440,
                        bottom: 1440,
                        left: 1440,
                    },
                },
            },
            children: paragraphs,
        }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${fileName}.docx`);
};

/**
 * Parser simples de HTML para paragraphs DOCX
 */
const parseHtmlToParagraphs = (html: string): Paragraph[] => {
    const paragraphs: Paragraph[] = [];

    // Remove tags de estilo e script
    let cleanHtml = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    cleanHtml = cleanHtml.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

    // Divide por tags de bloco principais
    const blockPattern = /<(h[1-6]|p|div|br)[^>]*>([\s\S]*?)<\/\1>|<br\s*\/?>/gi;
    const blocks = cleanHtml.split(/(?=<(?:h[1-6]|p|div))/i);

    for (const block of blocks) {
        if (!block.trim()) continue;

        // Detecta headers
        const h1Match = block.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
        const h2Match = block.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
        const h3Match = block.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i);
        const pMatch = block.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
        const divMatch = block.match(/<div[^>]*>([\s\S]*?)<\/div>/i);

        if (h1Match) {
            paragraphs.push(createHeading(h1Match[1], HeadingLevel.HEADING_1));
        } else if (h2Match) {
            paragraphs.push(createHeading(h2Match[1], HeadingLevel.HEADING_2));
        } else if (h3Match) {
            paragraphs.push(createHeading(h3Match[1], HeadingLevel.HEADING_3));
        } else if (pMatch) {
            paragraphs.push(createParagraph(pMatch[1]));
        } else if (divMatch) {
            // Processa conteúdo do div recursivamente
            const innerParagraphs = parseHtmlToParagraphs(divMatch[1]);
            paragraphs.push(...innerParagraphs);
        } else {
            // Texto sem tag específica
            const text = stripHtml(block);
            if (text.trim()) {
                paragraphs.push(createParagraph(text));
            }
        }
    }

    // Se não encontrou nada, tenta processar como texto simples
    if (paragraphs.length === 0) {
        const lines = stripHtml(html).split(/\n+/);
        for (const line of lines) {
            if (line.trim()) {
                paragraphs.push(createParagraph(line));
            }
        }
    }

    return paragraphs;
};

/**
 * Cria um heading formatado
 */
const createHeading = (text: string, level: typeof HeadingLevel[keyof typeof HeadingLevel]): Paragraph => {
    const cleanText = stripHtml(text);
    return new Paragraph({
        children: [
            new TextRun({
                text: cleanText,
                bold: true,
                size: level === HeadingLevel.HEADING_1 ? 32 : level === HeadingLevel.HEADING_2 ? 28 : 24,
            }),
        ],
        heading: level,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
    });
};

/**
 * Cria um paragraph com formatação básica
 */
const createParagraph = (html: string): Paragraph => {
    const runs: TextRun[] = [];

    // Processa negrito e outros estilos
    const parts = html.split(/(<strong>|<\/strong>|<b>|<\/b>|<em>|<\/em>|<i>|<\/i>)/i);

    let isBold = false;
    let isItalic = false;

    for (const part of parts) {
        const lowerPart = part.toLowerCase();

        if (lowerPart === '<strong>' || lowerPart === '<b>') {
            isBold = true;
        } else if (lowerPart === '</strong>' || lowerPart === '</b>') {
            isBold = false;
        } else if (lowerPart === '<em>' || lowerPart === '<i>') {
            isItalic = true;
        } else if (lowerPart === '</em>' || lowerPart === '</i>') {
            isItalic = false;
        } else {
            const cleanText = stripHtml(part);
            if (cleanText) {
                runs.push(new TextRun({
                    text: cleanText,
                    bold: isBold,
                    italics: isItalic,
                    size: 24, // 12pt
                }));
            }
        }
    }

    return new Paragraph({
        children: runs.length > 0 ? runs : [new TextRun({ text: stripHtml(html), size: 24 })],
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 120 },
    });
};

/**
 * Remove tags HTML e decodifica entidades
 */
const stripHtml = (html: string): string => {
    return html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
};
