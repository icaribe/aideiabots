import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Mic, MicOff } from 'lucide-react';

interface HotwordConfigProps {
  config: {
    enabled: boolean;
    keyword: string;
    sensitivity: number;
    contextDuration: number;
  };
  onChange: (config: any) => void;
  isListening: boolean;
  onToggleListening: () => void;
}

export const HotwordConfig = ({ 
  config, 
  onChange, 
  isListening, 
  onToggleListening 
}: HotwordConfigProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Settings className="h-4 w-4" />
          Controle de Voz por Palavra-Chave
        </CardTitle>
        <CardDescription className="text-xs">
          Configure uma palavra-chave para ativar o agente por voz
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch
              checked={config.enabled}
              onCheckedChange={(enabled) => updateConfig('enabled', enabled)}
            />
            <Label className="text-sm">Ativar escuta contínua</Label>
          </div>
          
          {config.enabled && (
            <Button
              size="sm"
              variant={isListening ? "destructive" : "default"}
              onClick={onToggleListening}
              className="flex items-center gap-1"
            >
              {isListening ? (
                <>
                  <MicOff className="h-3 w-3" />
                  Parar Escuta
                </>
              ) : (
                <>
                  <Mic className="h-3 w-3" />
                  Iniciar Escuta
                </>
              )}
            </Button>
          )}
        </div>

        {config.enabled && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full text-xs"
            >
              {isExpanded ? 'Ocultar' : 'Mostrar'} Configurações Avançadas
            </Button>

            {isExpanded && (
              <div className="space-y-4 pt-2 border-t">
                <div className="space-y-2">
                  <Label className="text-sm">Palavra-chave</Label>
                  <Input
                    value={config.keyword}
                    onChange={(e) => updateConfig('keyword', e.target.value)}
                    placeholder="Ex: assistente, jarvis, alexa"
                    className="text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    A palavra que ativará o agente
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">
                    Sensibilidade ({config.sensitivity.toFixed(1)})
                  </Label>
                  <Slider
                    value={[config.sensitivity]}
                    onValueChange={([value]) => updateConfig('sensitivity', value)}
                    min={0.5}
                    max={1.0}
                    step={0.1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    0.5 = mais flexível, 1.0 = palavra exata
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">
                    Duração de gravação ({config.contextDuration}s)
                  </Label>
                  <Slider
                    value={[config.contextDuration]}
                    onValueChange={([value]) => updateConfig('contextDuration', value)}
                    min={3}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Tempo de gravação após detectar a palavra-chave
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {isListening && (
          <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950 rounded-md">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-green-700 dark:text-green-300">
              Escutando por "{config.keyword}"...
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};