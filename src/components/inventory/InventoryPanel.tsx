import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, X, Sparkles } from 'lucide-react';
import { useRelicTheme } from '@/contexts/RelicThemeContext';
import { RelicCard } from './RelicCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

export const InventoryPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    inventory, 
    allRelics, 
    equippedRelic, 
    isLoading,
    equipRelic, 
    unequipRelic, 
    acquireRelic 
  } = useRelicTheme();

  const ownedRelicIds = new Set(inventory.map(item => item.relic_id));

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-40 glass p-3 rounded-full border border-primary/30 hover:border-primary/60 transition-all group"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Package className="w-6 h-6 text-primary group-hover:text-primary-glow transition-colors" />
        {equippedRelic && (
          <span className="absolute -top-1 -right-1 text-sm">
            {equippedRelic.icon}
          </span>
        )}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            />

            {/* Panel Content */}
            <motion.div
              initial={{ opacity: 0, x: -300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-96 max-w-[90vw] z-50 glass border-r border-primary/20"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h2 className="font-display text-xl text-foreground">Relics</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-destructive/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Current Equipped */}
              {equippedRelic && (
                <div className="p-4 border-b border-border/50 bg-primary/5">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                    Currently Active
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{equippedRelic.icon}</span>
                    <div>
                      <p className="font-display text-foreground">{equippedRelic.name}</p>
                      <p className="text-xs text-primary">Theme Active</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tabs */}
              <Tabs defaultValue="inventory" className="flex-1">
                <TabsList className="w-full justify-start rounded-none border-b border-border/50 bg-transparent p-0">
                  <TabsTrigger 
                    value="inventory"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    My Relics ({inventory.length})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="catalog"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    Catalog ({allRelics.length})
                  </TabsTrigger>
                </TabsList>

                <ScrollArea className="h-[calc(100vh-200px)]">
                  <TabsContent value="inventory" className="p-4 m-0">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                      </div>
                    ) : inventory.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No relics acquired yet</p>
                        <p className="text-sm">Check the catalog to acquire some!</p>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {inventory.map(item => item.relic && (
                          <RelicCard
                            key={item.id}
                            relic={item.relic}
                            isOwned={true}
                            isEquipped={item.is_equipped}
                            onEquip={() => equipRelic(item.relic_id)}
                            onUnequip={unequipRelic}
                          />
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="catalog" className="p-4 m-0">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {allRelics.map(relic => (
                          <RelicCard
                            key={relic.id}
                            relic={relic}
                            isOwned={ownedRelicIds.has(relic.id)}
                            isEquipped={equippedRelic?.id === relic.id}
                            onEquip={() => equipRelic(relic.id)}
                            onUnequip={unequipRelic}
                            onAcquire={() => acquireRelic(relic.id)}
                          />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
