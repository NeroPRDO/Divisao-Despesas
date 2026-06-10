import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card } from '../../components/Card';
import { PrimaryButton } from '../../components/PrimaryButton';
import { TextField } from '../../components/TextField';
import { useAuth } from '../../contexts/AuthContext';
import { createExpense } from '../../services/expensesService';
import { listGroupMembers } from '../../services/groupsService';
import { uploadReceiptImage } from '../../services/storageService';
import { colors, radius, spacing } from '../../theme';
import type { GroupMember } from '../../types/models';
import type { GroupsStackParamList } from '../../types/navigation';
import { parseCurrencyInput } from '../../utils/format';

type Props = NativeStackScreenProps<GroupsStackParamList, 'AddExpenseModal'>;

export function AddExpenseModalScreen({ route, navigation }: Props) {
  const { groupId } = route.params;
  const { user } = useAuth();
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [paidBy, setPaidBy] = useState(user?.id ?? '');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [receiptUri, setReceiptUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    listGroupMembers(groupId)
      .then((data) => {
        setMembers(data);
        const currentUserIsMember = data.some((member) => member.user_id === user?.id);
        setPaidBy(currentUserIsMember ? user?.id ?? data[0]?.user_id ?? '' : data[0]?.user_id ?? '');
      })
      .catch((error) => Alert.alert('Erro ao carregar membros', error instanceof Error ? error.message : 'Tente novamente.'));
  }, [groupId, user?.id]);

  async function pickFromGallery() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Permita acesso à galeria para anexar o recibo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true
    });

    if (!result.canceled) {
      setReceiptUri(result.assets[0].uri);
    }
  }

  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Permita acesso à câmera para fotografar o recibo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true
    });

    if (!result.canceled) {
      setReceiptUri(result.assets[0].uri);
    }
  }

  async function handleSave() {
    const parsedAmount = parseCurrencyInput(amount);

    if (!description.trim() || parsedAmount <= 0 || !paidBy || !user?.id) {
      Alert.alert('Dados inválidos', 'Informe descrição, valor e pagador da despesa.');
      return;
    }

    setLoading(true);
    try {
      let receiptUrl: string | null = null;
      if (receiptUri) {
        receiptUrl = await uploadReceiptImage(receiptUri, groupId, user.id);
      }

      await createExpense({
        groupId,
        paidBy,
        description,
        amount: parsedAmount,
        receiptUrl
      });

      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro ao salvar despesa', error instanceof Error ? error.message : 'Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Adicionar despesa</Text>
      <TextField label="Descrição" value={description} onChangeText={setDescription} placeholder="Ex: Supermercado" />
      <TextField
        label="Valor total"
        value={amount}
        onChangeText={setAmount}
        placeholder="Ex: 120,50"
        keyboardType="decimal-pad"
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quem pagou?</Text>
        {members.map((member) => {
          const selected = paidBy === member.user_id;
          return (
            <Pressable key={member.id} onPress={() => setPaidBy(member.user_id)} style={[styles.memberOption, selected && styles.memberSelected]}>
              <Text style={[styles.memberName, selected && styles.memberSelectedText]}>{member.user?.name ?? 'Participante'}</Text>
            </Pressable>
          );
        })}
      </View>

      <Card>
        <Text style={styles.sectionTitle}>Recibo</Text>
        <Text style={styles.description}>Anexe uma foto da nota fiscal ou comprovante para registrar a despesa.</Text>
        <View style={styles.receiptActions}>
          <PrimaryButton title="Galeria" variant="outline" onPress={pickFromGallery} />
          <PrimaryButton title="Câmera" variant="outline" onPress={takePhoto} />
        </View>
        {receiptUri ? <Image source={{ uri: receiptUri }} style={styles.preview} /> : null}
      </Card>

      <PrimaryButton title="Salvar despesa" onPress={handleSave} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.text
  },
  section: {
    gap: spacing.sm
  },
  sectionTitle: {
    fontWeight: '800',
    color: colors.text,
    fontSize: 16
  },
  description: {
    color: colors.muted,
    lineHeight: 20
  },
  memberOption: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md
  },
  memberSelected: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.primary
  },
  memberName: {
    color: colors.text,
    fontWeight: '700'
  },
  memberSelectedText: {
    color: colors.primary
  },
  receiptActions: {
    gap: spacing.sm
  },
  preview: {
    width: '100%',
    height: 180,
    borderRadius: radius.md,
    marginTop: spacing.sm
  }
});
