import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Loader2, Trash2, Search } from "lucide-react";

export default function NutritionCalculator() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState<number | null>(null);
  const [portionSize, setPortionSize] = useState<string>("100");
  const [activeTab, setActiveTab] = useState("calculator");

  // Fetch categories
  const categoriesQuery = trpc.nutrition.getCategories.useQuery();

  // Fetch foods based on search or category
  const foodsQuery = trpc.nutrition.getFoods.useQuery(
    {
      search: searchQuery || undefined,
      category: selectedCategory !== "all" ? selectedCategory : undefined,
    },
    { enabled: !searchQuery || searchQuery.length >= 2 }
  );

  // Fetch today's consumption
  const consumptionQuery = trpc.nutrition.getTodayConsumption.useQuery();

  // Add food mutation
  const addFoodMutation = trpc.nutrition.addFoodConsumption.useMutation({
    onSuccess: () => {
      consumptionQuery.refetch();
      setSelectedFood(null);
      setPortionSize("100");
    },
  });

  // Remove food mutation
  const removeFoodMutation = trpc.nutrition.removeFoodConsumption.useMutation({
    onSuccess: () => {
      consumptionQuery.refetch();
    },
  });

  const handleAddFood = () => {
    if (!selectedFood || !portionSize) return;

    addFoodMutation.mutate({
      foodId: selectedFood,
      portionSizeGrams: parseInt(portionSize),
    });
  };

  const handleRemoveFood = (consumptionId: number) => {
    removeFoodMutation.mutate({ consumptionId });
  };



  const selectedFoodData = foodsQuery.data?.find(f => f.id === selectedFood);
  const calculatedCalories = selectedFoodData && portionSize
    ? Math.round((selectedFoodData.caloriesPer100g * parseInt(portionSize)) / 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Calculadora Nutricional</h1>
          <p className="text-gray-600">Selecione alimentos e acompanhe suas calorias em tempo real</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="calculator">Calculadora</TabsTrigger>
            <TabsTrigger value="summary">Resumo do Dia</TabsTrigger>
          </TabsList>

          {/* Calculator Tab */}
          <TabsContent value="calculator" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Food Selection */}
              <div className="lg:col-span-2 space-y-6">
                {/* Search */}
                <Card>
                  <CardHeader>
                    <CardTitle>Buscar Alimentos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Digite o nome do alimento..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Category Selection */}
                {!searchQuery && selectedCategory !== "all" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Categorias</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os alimentos</SelectItem>
                          {categoriesQuery.data?.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>
                )}

                {/* Foods List */}
                <Card>
                  <CardHeader>
                    <CardTitle>Alimentos Disponíveis</CardTitle>
                    <CardDescription>
                      {foodsQuery.isLoading ? "Carregando..." : `${foodsQuery.data?.length || 0} alimentos`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {foodsQuery.isLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                      </div>
                    ) : foodsQuery.data && foodsQuery.data.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {foodsQuery.data.map((food) => (
                          <button
                            key={food.id}
                            onClick={() => setSelectedFood(food.id)}
                            className={`p-3 rounded-lg border-2 transition-all text-left ${
                              selectedFood === food.id
                                ? "border-blue-600 bg-blue-50"
                                : "border-gray-200 hover:border-blue-400 bg-white"
                            }`}
                          >
                            <div className="font-semibold text-gray-900">{food.name}</div>
                            <div className="text-sm text-gray-600">{food.caloriesPer100g} cal/100g</div>
                            <div className="text-xs text-gray-500 mt-1">{food.category}</div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center py-8 text-gray-500">Nenhum alimento encontrado</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Portion Size and Preview */}
              <div className="space-y-6">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle>Tamanho da Porção</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedFoodData ? (
                      <>
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-2">
                            {selectedFoodData.name}
                          </p>
                          <p className="text-xs text-gray-500 mb-3">{selectedFoodData.category}</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Gramas
                          </label>
                          <Input
                            type="number"
                            min="1"
                            value={portionSize}
                            onChange={(e) => setPortionSize(e.target.value)}
                            className="w-full"
                          />
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Calorias estimadas</p>
                          <p className="text-3xl font-bold text-blue-600">{calculatedCalories}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {selectedFoodData.caloriesPer100g} cal/100g
                          </p>
                        </div>

                        <Button
                          onClick={handleAddFood}
                          disabled={addFoodMutation.isPending}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          {addFoodMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Adicionando...
                            </>
                          ) : (
                            "Adicionar à Refeição"
                          )}
                        </Button>
                      </>
                    ) : (
                      <p className="text-center py-8 text-gray-500 text-sm">
                        Selecione um alimento para começar
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Calories Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Calorias Totais</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {consumptionQuery.data?.totals.calories || 0}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">kcal</p>
                </CardContent>
              </Card>

              {/* Protein Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Proteína</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">
                    {consumptionQuery.data?.totals.protein || 0}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">gramas</p>
                </CardContent>
              </Card>

              {/* Carbs Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Carboidratos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">
                    {consumptionQuery.data?.totals.carbs || 0}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">gramas</p>
                </CardContent>
              </Card>

              {/* Fat Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Gordura</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">
                    {consumptionQuery.data?.totals.fat || 0}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">gramas</p>
                </CardContent>
              </Card>
            </div>

            {/* Weight Gain Estimate */}
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardHeader>
                <CardTitle>Estimativa de Ganho de Peso</CardTitle>
                <CardDescription>
                  Com base na ingestão calórica de hoje (7.700 calorias = 1 kg)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Ganho em gramas</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {consumptionQuery.data?.totals.estimatedWeightGainGrams || 0}g
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Ganho em kg</p>
                    <p className="text-3xl font-bold text-pink-600">
                      {((consumptionQuery.data?.totals.estimatedWeightGainGrams || 0) / 1000).toFixed(3)}kg
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Foods Consumed Today */}
            <Card>
              <CardHeader>
                <CardTitle>Alimentos Consumidos Hoje</CardTitle>
                <CardDescription>
                  {consumptionQuery.data?.items.length || 0} alimento(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {consumptionQuery.isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  </div>
                ) : consumptionQuery.data?.items && consumptionQuery.data.items.length > 0 ? (
                  <div className="space-y-2">
                    {consumptionQuery.data.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.food?.name}</p>
                          <p className="text-sm text-gray-600">
                            {item.portionSizeGrams}g • {item.calories} kcal
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFood(item.id)}
                          disabled={removeFoodMutation.isPending}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-gray-500">Nenhum alimento adicionado ainda</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

