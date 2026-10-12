import React, { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fonts, spacing } from '../theme';
import { haptics } from '../shared/services/haptics';
import { usePersistentState } from '../shared/hooks/usePersistentState';
import { useTasks } from '../features/tasks/useTasks';
import { TaskItem } from '../features/tasks/TaskItem';
import { PETS, DEFAULT_PET_ID } from '../features/pet/petConfig';
import { usePetMood } from '../features/pet/usePetMood';
import { PetWidget } from '../features/pet/PetWidget';
import { PetPicker } from '../features/pet/PetPicker';
import { ProgressYarn } from '../components/ProgressYarn';
import { TaskInput } from '../components/TaskInput';

const formatToday = () => {
  const s = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const keyExtractor = (t) => t.id;

/**
 * MainScreen = ORQUESTRADORA. Liga três mundos independentes:
 *   tarefas (domínio)  →  máquina do pet (derivação)  →  UI (apresentação)
 * e é o único lugar que sabe QUANDO disparar haptics e recompensas — assim
 * TaskItem e PetWidget continuam burros e reutilizáveis.
 */
export default function MainScreen() {
  const { tasks, stats, hydrated, addTask, toggleTask, removeTask } = useTasks();
  const [petId, setPetId, petReady] = usePersistentState('cozy:pet:v1', DEFAULT_PET_ID);
  const [rewardSignal, setRewardSignal] = useState(0);

  const pet = PETS[petId] ?? PETS[DEFAULT_PET_ID];
  const mood = usePetMood({ total: stats.total, done: stats.done, rewardSignal });

  // Ref com o snapshot mais recente: permite que handleToggle/handleDelete sejam
  // ESTÁVEIS (deps fixas). Se dependessem de `tasks`, mudariam a cada toggle e
  // quebrariam o React.memo de todas as linhas.
  const latest = useRef({ tasks, stats });
  latest.current = { tasks, stats };

  const handleAdd = useCallback(
    (text) => {
      if (addTask(text)) haptics.add();
    },
    [addTask]
  );

  const handleToggle = useCallback(
    (id) => {
      const { tasks: current, stats: s } = latest.current;
      const task = current.find((t) => t.id === id);
      if (!task) return;

      toggleTask(id);

      if (task.done) {
        haptics.tap(); // desmarcou: feedback discreto, sem festa
        return;
      }
      setRewardSignal((n) => n + 1); // dispara o estado REWARD do pet
      // Concluiu a última pendente → vibração de sucesso; senão, tap leve.
      if (s.done + 1 === s.total) haptics.success();
      else haptics.check();
    },
    [toggleTask]
  );

  const handleDelete = useCallback(
    (id) => {
      const { tasks: current, stats: s } = latest.current;
      const task = current.find((t) => t.id === id);
      removeTask(id);

      // Apagar a última pendente também "zera" o dia.
      const pendingAfter = s.remaining - (task && !task.done ? 1 : 0);
      if (task && !task.done && pendingAfter === 0 && s.total - 1 > 0) haptics.success();
      else haptics.remove();
    },
    [removeTask]
  );

  const handleSelectPet = useCallback(
    (id) => {
      haptics.tap();
      setPetId(id);
    },
    [setPetId]
  );

  const renderItem = useCallback(
    ({ item }) => (
      <TaskItem task={item} accent={pet.accent} onToggle={handleToggle} onDelete={handleDelete} />
    ),
    [pet.accent, handleToggle, handleDelete]
  );

  // Evita "flash" com dados padrão antes da leitura do disco.
  if (!hydrated || !petReady) return null;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Tocar em qualquer área "vazia" fecha o teclado. A lista cuida do seu
            próprio dismiss via keyboardDismissMode="on-drag". */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.flex}>
            <View style={styles.header}>
              <Text style={styles.title}>Hoje</Text>
              <Text style={styles.date}>{formatToday()}</Text>
            </View>

            <PetPicker selectedId={pet.id} onSelect={handleSelectPet} />

            <View style={styles.section}>
              <PetWidget pet={pet} mood={mood} remaining={stats.remaining} total={stats.total} />
            </View>

            <View style={styles.section}>
              <ProgressYarn
                progress={stats.progress}
                icon={pet.progressIcon}
                color={pet.accent}
                label={`${stats.done}/${stats.total}`}
              />
            </View>

            <FlatList
              style={styles.flex}
              data={tasks}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}
            />

            <TaskInput onSubmit={handleAdd} accent={pet.accent} />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.md },
  title: { fontFamily: fonts.black, fontSize: 34, color: colors.ink },
  date: { fontFamily: fonts.bold, fontSize: 15, color: colors.inkSoft },
  section: { paddingHorizontal: spacing.lg, marginTop: spacing.md },
  listContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md },
});
