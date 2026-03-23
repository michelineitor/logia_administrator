"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Power, PowerOff, Save, X } from "lucide-react";
import { createRuleAction, updateRuleAction, deleteRuleAction, toggleRuleAction } from "./actions";
import { AlertCategory, AlertSeverity } from "@prisma/client";

export default function AlertsClient({ initialRules }: { initialRules: any[] }) {
  const [rules, setRules] = useState(initialRules);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "FINANCIAL",
    severity: "WARNING",
    logic_dataSource: "INCOMES",
    logic_modifier: "CURRENT_MONTH",
    logic_operator: "<",
    logic_compareTo: "STATIC",
    logic_compareValue: "0",
  });

  const handleOpenModal = (rule?: any) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        name: rule.name,
        description: rule.description || "",
        category: rule.category,
        severity: rule.severity,
        logic_dataSource: rule.logic.dataSource,
        logic_modifier: rule.logic.modifier,
        logic_operator: rule.logic.operator,
        logic_compareTo: rule.logic.compareTo,
        logic_compareValue: rule.logic.compareValue.toString(),
      });
    } else {
      setEditingRule(null);
      setFormData({
        name: "",
        description: "",
        category: "FINANCIAL",
        severity: "WARNING",
        logic_dataSource: "INCOMES",
        logic_modifier: "CURRENT_MONTH",
        logic_operator: "<",
        logic_compareTo: "STATIC",
        logic_compareValue: "0",
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const dataToSave = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      severity: formData.severity,
      logic: {
        dataSource: formData.logic_dataSource,
        modifier: formData.logic_modifier,
        operator: formData.logic_operator,
        compareTo: formData.logic_compareTo,
        compareValue: parseFloat(formData.logic_compareValue) || 0,
      }
    };

    try {
      if (editingRule) {
        await updateRuleAction(editingRule.id, dataToSave);
        setRules(rules.map(r => r.id === editingRule.id ? { ...r, ...dataToSave } : r));
      } else {
        await createRuleAction(dataToSave);
        // Refresh page to get new ID ideally, but optimistic update works if we just reload
        window.location.reload();
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      alert("Error guardando la regla");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta regla?")) {
      await deleteRuleAction(id);
      setRules(rules.filter(r => r.id !== id));
    }
  };

  const handleToggle = async (id: string, currentActive: boolean) => {
    await toggleRuleAction(id, !currentActive);
    setRules(rules.map(r => r.id === id ? { ...r, isActive: !currentActive } : r));
  };

  const getSeverityColor = (sev: string) => {
    if (sev === 'ERROR') return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
    if (sev === 'WARNING') return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Reglas de Alertas</h2>
          <p className="text-sm text-muted-foreground">Configura las condiciones de las alertas del dashboard principal.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nueva Regla
        </button>
      </div>

      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-white/5 border-b border-white/5">
              <tr>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Nombre / Categoría</th>
                <th className="px-6 py-4">Lógica</th>
                <th className="px-6 py-4">Severidad</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr key={rule.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleToggle(rule.id, rule.isActive)}
                      className={`p-2 rounded-full transition-colors ${rule.isActive ? 'bg-emerald-400/20 text-emerald-400' : 'bg-white/10 text-muted-foreground'}`}
                    >
                      {rule.isActive ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold">{rule.name}</p>
                    <p className="text-xs text-muted-foreground">{rule.category}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-xs">
                      <span className="bg-white/10 px-2 py-1 rounded inline-block w-max">
                        {rule.logic.dataSource} ({rule.logic.modifier})
                      </span>
                      <span className="font-bold text-center w-max px-2">{rule.logic.operator}</span>
                      <span className="bg-white/10 px-2 py-1 rounded inline-block w-max">
                        {rule.logic.compareTo} 
                        {rule.logic.compareTo === 'STATIC' || rule.logic.compareTo === 'AVERAGE_6_MONTHS' 
                          ? ` (${rule.logic.compareValue})` : ''}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest border ${getSeverityColor(rule.severity)}`}>
                      {rule.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleOpenModal(rule)} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-blue-400">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(rule.id)} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-rose-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rules.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No hay reglas configuradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/5 flex justify-between items-center sticky top-0 bg-background/95 backdrop-blur z-10">
              <h3 className="text-lg font-bold">
                {editingRule ? "Editar Regla de Alerta" : "Nueva Regla de Alerta"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm text-muted-foreground">Nombre de la Alerta</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors"
                    placeholder="Ej. Gastos altos en eventos"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm text-muted-foreground">Descripción</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Categoría</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-[#1a1c23] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="FINANCIAL">Financiera</option>
                    <option value="OPERATIONAL">Operativa</option>
                    <option value="GOVERNANCE">Gobernanza</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Severidad</label>
                  <select
                    value={formData.severity}
                    onChange={e => setFormData({...formData, severity: e.target.value})}
                    className="w-full bg-[#1a1c23] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="INFO">Información (Info)</option>
                    <option value="WARNING">Advertencia (Amarillo)</option>
                    <option value="ERROR">Crítico (Rojo)</option>
                  </select>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-white/5 bg-white/5 space-y-4">
                <h4 className="font-bold text-sm uppercase tracking-widest text-primary mb-2">Lógica de Evaluación</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground uppercase">Dato a Evaluar</label>
                    <select
                      value={formData.logic_dataSource}
                      onChange={e => setFormData({...formData, logic_dataSource: e.target.value})}
                      className="w-full bg-[#1a1c23] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                    >
                      <option value="INCOMES">Ingresos (UYU)</option>
                      <option value="EXPENSES">Egresos (UYU)</option>
                      <option value="RESERVES">Reservas Totales</option>
                      <option value="MEMBERS_DEBT">Miembros Morosos</option>
                      <option value="UNVERIFIED_EXPENSES">Gastos sin Comprobante</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground uppercase">Modificador Matemático</label>
                    <select
                      value={formData.logic_modifier}
                      onChange={e => setFormData({...formData, logic_modifier: e.target.value})}
                      className="w-full bg-[#1a1c23] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                    >
                      <option value="CURRENT_MONTH">Valor mes actual</option>
                      <option value="RUNWAY_MONTHS">Meses de Autonomía (Runway)</option>
                      <option value="COUNT">Conteo Simple</option>
                      <option value="PERCENTAGE">Porcentaje del Total</option>
                    </select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs text-muted-foreground uppercase">Operador</label>
                    <select
                      value={formData.logic_operator}
                      onChange={e => setFormData({...formData, logic_operator: e.target.value})}
                      className="w-full bg-[#1a1c23] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                    >
                      <option value="<">Menor que (&lt;)</option>
                      <option value=">">Mayor que (&gt;)</option>
                      <option value="=">Igual a (=)</option>
                      <option value="<=">Menor o igual que (&lt;=)</option>
                      <option value=">=">Mayor o igual que (&gt;=)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground uppercase">Comparar Contra</label>
                    <select
                      value={formData.logic_compareTo}
                      onChange={e => setFormData({...formData, logic_compareTo: e.target.value})}
                      className="w-full bg-[#1a1c23] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                    >
                      <option value="STATIC">Valor Estático</option>
                      <option value="AVERAGE_6_MONTHS">Promedio últimos 6 meses</option>
                      <option value="EXPENSES_CURRENT_MONTH">Gastos del mes actual</option>
                      {/* <option value="BUDGET">Presupuesto Establecido</option> */}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground uppercase">Valor de Referencia / Multiplicador</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.logic_compareValue}
                      onChange={e => setFormData({...formData, logic_compareValue: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                      placeholder="Ej. 3, 0.7, 100..."
                    />
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      Si comparas contra un promedio, usa 1 para 100%, 0.7 para 70%, etc. Si es un valor estático, usa el valor exacto.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            <div className="p-6 border-t border-white/5 flex justify-end gap-4 sticky bottom-0 bg-background/95 backdrop-blur z-10">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm hover:bg-white/5 rounded-lg transition-colors"
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving || !formData.name}
                className="btn-primary flex items-center gap-2"
              >
                {isSaving ? <span className="animate-pulse">Guardando...</span> : <><Save className="w-4 h-4"/> Guardar Regla</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
