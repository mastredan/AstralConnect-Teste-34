import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Star, Eye, Download, Calendar, MapPin } from 'lucide-react';

interface AstralMapCardProps {
  astralMapData: any;
  onView: () => void;
}

export function AstralMapCard({ astralMapData, onView }: AstralMapCardProps) {
  if (!astralMapData) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-6"
    >
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 border-purple-200 dark:border-purple-800 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg text-purple-800 dark:text-purple-200">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Star className="w-5 h-5" />
            </motion.div>
            Meu Mapa Astral
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic Info */}
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{astralMapData.data} às {astralMapData.hora}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{astralMapData.local}</span>
            </div>
          </div>

          {/* Zodiac Signs */}
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              ☀️ {astralMapData.signo_solar}
            </Badge>
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              ⬆️ {astralMapData.ascendente}
            </Badge>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              🌙 {astralMapData.fase_lua?.fase_lua_natal || 'Não disponível'}
            </Badge>
            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              🍀 {astralMapData.numero_da_sorte}
            </Badge>
          </div>

          {/* Quick Summary */}
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
              {astralMapData.perfil_resumido}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={onView}
              className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
            >
              <Eye className="w-4 h-4 mr-2" />
              Ver Completo
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}