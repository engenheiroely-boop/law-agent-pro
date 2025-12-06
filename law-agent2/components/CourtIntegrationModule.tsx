
import React, { useState } from 'react';
import { Search, Scale, FileText, AlertCircle, Calendar, ArrowRight, ExternalLink } from 'lucide-react';
import { searchLawsuits, Lawsuit } from '../services/courtService';

export const CourtIntegrationModule: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<Lawsuit[]>([]);
    const [selectedLawsuit, setSelectedLawsuit] = useState<Lawsuit | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    // Manipula a busca
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        setLoading(true);
        setResults([]);
        setSelectedLawsuit(null);
        try {
            const data = await searchLawsuits(searchTerm);
            setResults(data);
        } catch (error) {
            console.error("Erro ao buscar processos", error);
        } finally {
            setLoading(false);
            setHasSearched(true);
        }
    };

    // Renderiza a lista de resultados
    const renderResults = () => {
        if (loading) {
            return (
                <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            );
        }

        if (hasSearched && results.length === 0) {
            return (
                <div className="text-center p-8 text-muted-foreground">
                    <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum processo encontrado para "{searchTerm}"</p>
                </div>
            );
        }

        return (
            <div className="space-y-4 mt-6">
                {results.map((lawsuit) => (
                    <div
                        key={lawsuit.id}
                        onClick={() => setSelectedLawsuit(lawsuit)}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${selectedLawsuit?.id === lawsuit.id
                                ? 'bg-accent/10 border-accent'
                                : 'bg-card hover:bg-muted/50 border-border'
                            }`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-semibold text-foreground flex items-center gap-2">
                                    <Scale className="h-4 w-4" />
                                    {lawsuit.number}
                                </h3>
                                <p className="text-sm text-muted-foreground">{lawsuit.court}</p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${lawsuit.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                    lawsuit.status === 'suspended' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                        'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                }`}>
                                {lawsuit.status === 'active' ? 'Ativo' : lawsuit.status === 'suspended' ? 'Suspenso' : 'Arquivado'}
                            </span>
                        </div>
                        <div className="text-sm">
                            <p><span className="font-medium">Autor:</span> {lawsuit.parties.plaintiff}</p>
                            <p><span className="font-medium">Réu:</span> {lawsuit.parties.defendant}</p>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // Renderiza os detalhes do processo selecionado (Timeline)
    const renderLawsuitDetails = () => {
        if (!selectedLawsuit) return null;

        return (
            <div className="bg-card rounded-xl border border-border shadow-sm h-full flex flex-col">
                <div className="p-6 border-b border-border">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-foreground mb-1">{selectedLawsuit.number}</h2>
                            <div className="flex gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1"><Scale className="h-3 w-3" /> {selectedLawsuit.court}</span>
                                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Atualizado: {selectedLawsuit.lastUpdate}</span>
                            </div>
                        </div>
                        <button className="text-primary hover:text-primary/80 text-sm flex items-center gap-1">
                            Ver no Tribunal <ExternalLink className="h-3 w-3" />
                        </button>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                        <div className="p-3 bg-muted/30 rounded-lg">
                            <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Parte Autora</span>
                            <p className="font-medium">{selectedLawsuit.parties.plaintiff}</p>
                        </div>
                        <div className="p-3 bg-muted/30 rounded-lg">
                            <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Parte Ré</span>
                            <p className="font-medium">{selectedLawsuit.parties.defendant}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 flex-1 overflow-auto">
                    <h3 className="font-semibold mb-4 text-lg">Últimas Movimentações</h3>
                    <div className="space-y-6 relative ml-2 before:content-[''] before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border">
                        {selectedLawsuit.movements.map((movement, index) => (
                            <div key={index} className="relative pl-8">
                                <div className={`absolute left-0 top-1 w-4 h-4 rounded-full border-2 bg-background z-10 
                  ${movement.type === 'DECISION' ? 'border-red-500' :
                                        movement.type === 'hearing' ? 'border-orange-500' :
                                            movement.type === 'dispatch' ? 'border-blue-500' : 'border-gray-400'}`}
                                />
                                <div className="bg-muted/20 p-4 rounded-lg border border-border/50 hover:border-border transition-colors">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase
                      ${movement.type === 'DECISION' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                                                movement.type === 'hearing' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400' :
                                                    movement.type === 'dispatch' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                                                        'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'}`}>
                                            {movement.type === 'DECISION' ? 'Decisão' : movement.type === 'hearing' ? 'Audiência' : movement.type === 'dispatch' ? 'Despacho' : movement.description.split(' ')[0]}
                                        </span>
                                        <span className="text-xs text-muted-foreground">{movement.date}</span>
                                    </div>
                                    <p className="text-sm text-foreground leading-relaxed">{movement.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto h-[calc(100vh-2rem)] flex flex-col">
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 mb-2">
                    Tribunais & Processos
                </h1>
                <p className="text-muted-foreground">
                    Consulte andamentos processuais integrados com TJ, TRF e STJ.
                </p>
            </div>

            <div className="grid grid-cols-12 gap-8 flex-1 min-h-0">
                {/* Coluna da Esquerda: Busca e Lista */}
                <div className="col-span-4 flex flex-col min-h-0">
                    <div className="bg-card p-4 rounded-xl border border-border shadow-sm mb-4">
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                placeholder="Número do processo, OAB ou nome..."
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground p-1.5 rounded-md hover:bg-primary/90 transition-colors"
                                disabled={loading}
                            >
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </form>
                        <div className="mt-3 flex gap-2 text-xs text-muted-foreground">
                            <span className="px-2 py-1 bg-muted rounded">TJSC</span>
                            <span className="px-2 py-1 bg-muted rounded">TRF4</span>
                            <span className="px-2 py-1 bg-muted rounded">STJ</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto pr-2">
                        {renderResults()}
                    </div>
                </div>

                {/* Coluna da Direita: Detalhes do Processo */}
                <div className="col-span-8 min-h-0">
                    {selectedLawsuit ? (
                        renderLawsuitDetails()
                    ) : (
                        <div className="h-full bg-card rounded-xl border border-border border-dashed flex flex-col items-center justify-center text-muted-foreground p-8">
                            <div className="bg-muted/50 p-6 rounded-full mb-4">
                                <FileText className="h-12 w-12 opacity-50" />
                            </div>
                            <h3 className="text-xl font-medium mb-2">Selecione um Processo</h3>
                            <p className="text-center max-w-md">
                                Busque por um processo na barra lateral e clique para visualizar os detalhes, partes envolvidas e histórico de movimentações.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
