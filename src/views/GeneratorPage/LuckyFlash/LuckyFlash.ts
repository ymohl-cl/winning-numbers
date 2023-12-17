import { defineComponent } from "vue";
import { useStore } from '@/store';
import { ModuleIdentifier } from "@/store/modules/generator";
import { toastController } from '@ionic/vue'
import GeneratorCard from "@/components/GeneratorCard/GeneratorCard.vue";
import { GeneratorCardProps } from "@/components/GeneratorCard/GeneratorCard";
import { Draw } from "@/store/models/draw";
import ConfigButton from "@/components/ConfigButton/ConfigButton.vue";
import { ConfigButtonProps } from "@/components/ConfigButton/ConfigButton";
import { ConfigLuckyFlash } from "@/store/models/generator";

export default defineComponent({
	name: "LuckyFlash",
	components: {
		GeneratorCard,
		ConfigButton,
	},
	watch: {
	},
	setup() {
		useStore();

		return {}
	},
	data() {
		const config: ConfigLuckyFlash = this.$store.getters.getLuckyConfig
		const cardProps: GeneratorCardProps = {
			srcImage: require('@/assets/lucky_flash_ban2.png'),
			title: "Du genre à jouer la date de naissance de mémé ?",
			description: "Vous pouvez affiner vos critères de tirage dans la rubrique configuration ci-dessous",
			buttonMessage: "Générer un tirage",
			showLoaderButton: false,
			draws: undefined,
		}
		const configProps: ConfigButtonProps = {
			id: "lucky-flash-generator",
			state: config,
			signal: false,
		}
		const data = {
			explainUsage: "Le lucky flash est un générateur de tirage qui se base sur votre porte bonheur pour vous fournir le tirage unique qui lui est associé. Pas d'inspiration ? Donnez-nous le prénom de votre bien aimé(e), celui de votre chat ou ce qui vous passe par la tête. On s'occupe du reste !",
			titleConfiguration: "Votre configuration",
			labelExpertMode: "Activer le mode expert (un porte bonheur différent pour chaque boule)",
			labelInput: "Votre porte bonheur",
			labelMultiInput1: "Votre porte bonheur (pour la boule 1)",
			labelMultiInput2: "Votre porte bonheur (pour la boule 2)",
			labelMultiInput3: "Votre porte bonheur (pour la boule 3)",
			labelMultiInput4: "Votre porte bonheur (pour la boule 4)",
			labelMultiInput5: "Votre porte bonheur (pour la boule 5)",
			labelMultiInputLucky: "Votre porte bonheur (pour la boule chance)",
			placeholderInput1: "ex: ma mémé Manou",
			placeholderInput2: "ex: Maman",
			placeholderInput3: "ex: Kimo le chat",
			placeholderInput4: "ex: Benji",
			placeholderInput5: "ex: Fredo",
			placeholderInputLucky: "ex: mes potes Max et Vinc",
			maxLengthInput: 40,
			invalidInputMessage: "veuillez fournir un porte bonheur (40 caractères maximum)",
		}

		return {
			configProps,
			cardProps,
			config,
			data,
		}
	},
	methods: {
		undoConfiguration(): void {
			this.$store.dispatch(ModuleIdentifier.LOAD_LUCKY_CONFIG).then((): void => {
				this.configProps.signal = !this.configProps.signal
			})
		},
		saveConfiguration(): void {
			this.$store.commit(ModuleIdentifier.SET_LUCKY_CONFIG, this.config)
			this.configProps.signal = !this.configProps.signal
		},
		resetConfiguration(): void {
			this.$store.dispatch(ModuleIdentifier.RESET_DEFAULT_LUCKY_CONFIG).then((): void => {
				this.configProps.signal = !this.configProps.signal
			})
		},
		generate(): void {
			if (!this.configIsValid()) {
				toastController.create({
					message: this.data.invalidInputMessage,
					duration: 4000,
				}).then((toast: HTMLIonToastElement): void => {
					toast.present()
				})
				return
			}

			this.cardProps.showLoaderButton = true
			this.$store.dispatch(ModuleIdentifier.GENERATE_LUCKY_DRAW, this.config).then((draw: Draw): void => {
				this.cardProps.draws = draw
				this.cardProps.description = "Bravo, vous avez généré un tirage ! N'oubliez pas de le jouer et bonne chance"
				this.cardProps.showLoaderButton = false
			}).catch((err: Error) => {
				console.log(err)
				toastController.create({
					message: "impossible de générer un tirage",
					duration: 2000,
				}).then((toast: HTMLIonToastElement): void => {
					toast.present()
				})

				this.cardProps.showLoaderButton = false
			})
		},
		inputIsValid(input: string): boolean {
			return input.length <= this.data.maxLengthInput && input.length > 0
		},
		configIsValid(): boolean {
			if (!this.config.multiInput) {
				return this.inputIsValid(this.config.ball1Input)
			}

			if (
				this.inputIsValid(this.config.ball1Input) &&
				this.inputIsValid(this.config.ball2Input) &&
				this.inputIsValid(this.config.ball3Input) &&
				this.inputIsValid(this.config.ball4Input) &&
				this.inputIsValid(this.config.ball5Input) &&
				this.inputIsValid(this.config.luckyInput)) {
				return true
			}

			return false
		}
	},
})
