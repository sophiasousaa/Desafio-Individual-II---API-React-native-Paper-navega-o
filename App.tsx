import 'react-native-gesture-handler';
import * as React from 'react';
import { View, StyleSheet, FlatList, Image } from 'react-native';
import { NavigationContainer, DrawerActions, DefaultTheme as NavLight } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  Provider as PaperProvider,
  MD3LightTheme,
  Appbar,
  Text,
  Button,
  Card,
  Icon,
  ActivityIndicator,
} from 'react-native-paper';

// ---- Tipos de rotas ----
type RootDrawerParamList = {
  Principal: undefined;
  Sobre: undefined;
};

type RootStackParamList = {
  Tabs: undefined;
  Detalhes: { produto: Produto } | undefined;
};

const Drawer = createDrawerNavigator<RootDrawerParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator();

// ---- Temas ----
const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    background: '#FAFAFA',
    surface: '#FFFFFF',
  },
};

const navTheme = {
  ...NavLight,
  colors: {
    ...NavLight.colors,
    background: '#FAFAFA',
    card: '#FFFFFF',
    text: '#1F2937',
    border: '#E5E7EB',
  },
};

// ---- Tipagem do produto ----
type Produto = {
  id: number;
  name: string;
  brand: string;
  price: string;
  image_link: string;
  product_type: string;
  description: string;
};

// ---- Header padrão ----
function Header({ title, navigation }: any) {
  return (
    <Appbar.Header mode="center-aligned">
      <Appbar.Action icon="menu" onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())} />
      <Appbar.Content title={title} />
    </Appbar.Header>
  );
}

// ---- Tela Home: lista de produtos ----
function HomeScreen({ navigation }: any) {
  const [produtos, setProdutos] = React.useState<Produto[]>([]);
  const [carregando, setCarregando] = React.useState(true);

  React.useEffect(() => {
    fetch('https://makeup-api.herokuapp.com/api/v1/products.json?brand=maybelline')
      .then((res) => res.json())
      .then((data) => {
        setProdutos(data.slice(0, 15)); // mostra os 15 primeiros produtos
        setCarregando(false);
      })
      .catch(() => setCarregando(false));
  }, []);

  if (carregando) {
    return (
      <ScreenContainer>
        <ActivityIndicator animating size="large" />
        <Text>Carregando produtos...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <FlatList
        data={produtos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Card
            mode="elevated"
            style={styles.card}
            onPress={() => navigation.navigate('Detalhes', { produto: item })}
          >
            <Card.Cover source={{ uri: item.image_link }} />
            <Card.Title
              title={item.name}
              subtitle={item.brand}
              left={(props) => <Icon source="lipstick" size={24} {...props} />}
            />
            <Card.Content>
              <Text variant="bodyMedium">💰 ${item.price || '0.00'}</Text>
              <Text variant="bodySmall" numberOfLines={2}>
                {item.description || 'Produto sem descrição.'}
              </Text>
            </Card.Content>
          </Card>
        )}
      />
    </ScreenContainer>
  );
}

// ---- Tela Feed ----
function FeedScreen() {
  return (
    <ScreenContainer>
      <Card mode="elevated">
        <Card.Title title="Feed de Beleza" left={(p) => <Icon source="rss" size={24} {...p} />} />
        <Card.Content>
          <Text>
            Aqui você verá as novidades e lançamentos do mundo da maquiagem 💋
          </Text>
        </Card.Content>
      </Card>
    </ScreenContainer>
  );
}

// ---- Tabs ----
function TabsScreen() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#d63384',
        tabBarStyle: { backgroundColor: '#FFFFFF' },
        tabBarIcon: ({ color, size }) => {
          const icon = route.name === 'Home' ? 'lipstick' : 'rss';
          return <Icon source={icon as any} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="Feed" component={FeedScreen} />
    </Tabs.Navigator>
  );
}

// ---- Tela de Detalhes ----
function DetalhesScreen({ route, navigation }: any) {
  const produto: Produto = route.params?.produto;

  return (
    <>
      <Header title="Detalhes do Produto" navigation={navigation} />
      <ScreenContainer>
        <Card>
          <Card.Cover source={{ uri: produto.image_link }} />
          <Card.Title
            title={produto.name}
            subtitle={produto.brand}
            left={(p) => <Icon source="makeup" size={24} {...p} />}
          />
          <Card.Content>
            <Text variant="titleMedium">💄 Tipo: {produto.product_type}</Text>
            <Text variant="titleMedium">💰 Preço: ${produto.price || '0.00'}</Text>
            <Text style={{ marginTop: 8 }}>{produto.description}</Text>
          </Card.Content>
          <Card.Actions>
            <Button onPress={() => navigation.goBack()}>Voltar</Button>
          </Card.Actions>
        </Card>
      </ScreenContainer>
    </>
  );
}

// ---- Stack principal ----
function StackPrincipal({ navigation }: any) {
  return (
    <>
      <Header title="Catálogo de Maquiagem" navigation={navigation} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tabs" component={TabsScreen} />
        <Stack.Screen name="Detalhes" component={DetalhesScreen} />
      </Stack.Navigator>
    </>
  );
}

// ---- Tela Sobre ----
function SobreScreen({ navigation }: any) {
  return (
    <>
      <Header title="Sobre" navigation={navigation} />
      <ScreenContainer>
        <Card>
          <Card.Title title="Sobre o App" left={(p) => <Icon source="information" size={24} {...p} />} />
          <Card.Content>
            <Text>
              💅 Catálogo de maquiagem feito com React Native Paper + React Navigation.
            </Text>
          </Card.Content>
        </Card>
      </ScreenContainer>
    </>
  );
}

// ---- Componente auxiliar ----
function ScreenContainer({ children }: { children: React.ReactNode }) {
  return <View style={styles.screen}>{children}</View>;
}

// ---- App principal ----
export default function App() {
  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer theme={navTheme}>
        <Drawer.Navigator
          screenOptions={{
            headerShown: false,
            drawerActiveTintColor: '#d63384',
            drawerStyle: { backgroundColor: '#FFFFFF' },
          }}
        >
          <Drawer.Screen
            name="Principal"
            component={StackPrincipal}
            options={{
              drawerIcon: ({ color, size }) => <Icon source="view-dashboard" size={size} color={color} />,
            }}
          />
          <Drawer.Screen
            name="Sobre"
            component={SobreScreen}
            options={{
              drawerIcon: ({ color, size }) => <Icon source="information-outline" size={size} color={color} />,
            }}
          />
        </Drawer.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

// ---- Estilos ----
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FAFAFA',
    gap: 16,
  },
  card: {
    marginBottom: 16,
  },
});
