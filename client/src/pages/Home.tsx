import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_TITLE } from "@/const";
import { useLocation } from "wouter";
import { Apple, TrendingUp, Zap } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">{APP_TITLE}</h1>
          <div className="flex gap-3">
            <Button
              onClick={() => setLocation("/calculadora")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Ir para Calculadora
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Calculadora Nutricional Inteligente
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Acompanhe suas calorias e estime o ganho de peso com base na sua ingestao diaria
          </p>
          <Button
            onClick={() => setLocation("/calculadora")}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
          >
            Comece Agora
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Apple className="h-6 w-6 text-green-600" />
                <CardTitle>Banco de Dados Completo</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Acesso a mais de 40 alimentos com informacoes nutricionais detalhadas incluindo calorias, proteinas, carboidratos e gorduras.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Zap className="h-6 w-6 text-yellow-600" />
                <CardTitle>Calculos em Tempo Real</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Veja instantaneamente o total de calorias e nutrientes conforme adiciona alimentos a sua refeicao.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-6 w-6 text-blue-600" />
                <CardTitle>Estimativa de Peso</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Calcule o ganho de peso estimado com base na ingestao calorica (7.700 calorias = 1 kg).
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Como Funciona</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-lg">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Acesse a Calculadora</h4>
              <p className="text-gray-600 text-sm">Clique no botao para acessar a calculadora sem necessidade de login</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-lg">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Selecione Alimentos</h4>
              <p className="text-gray-600 text-sm">Escolha os alimentos que consumiu da nossa base de dados</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-lg">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Defina Porcoes</h4>
              <p className="text-gray-600 text-sm">Indique o tamanho da porcao em gramas</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-lg">4</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Veja Resultados</h4>
              <p className="text-gray-600 text-sm">Acompanhe calorias e ganho de peso estimado</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16 py-8">
        <div className="max-w-6xl mx-auto px-4 md:px-8 text-center">
          <p className="text-gray-400">
            2024 {APP_TITLE}. Desenvolvido para ajudar voce a acompanhar sua nutricao.
          </p>
        </div>
      </footer>
    </div>
  );
}

