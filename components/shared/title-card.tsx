import { Button } from '../ui/button'

const TitleCard = ({ image, title, description, action, onClick, icon }: { image: string, title: string, description?: string, action?: string, onClick?: () => void , icon?:React.ReactNode}) => {
    return (
        <div className="px-5 relative rounded-2xl hover:shadow-xl transition-all duration-300 
                 overflow-hidden h-full">

            {/* Background */}
            <div className="absolute inset-0 z-0">
                {image &&
                    <img
                        src={image}
                        alt={image}
                        className="w-full h-full object-cover brightness-75 group-hover:scale-105 transition-transform duration-500"
                    />
                }
                <div className="absolute inset-0 bg-linear-to-r from-black/70 to-black/50" />
            </div>

            {/* Content */}
            <div className="relative z-10 text-white text-center md:text-left space-y-6 py-12">
                <div className='flex'>
                    {icon && <div className="mb-4 me-2">{icon}</div>}
                    <h2 className="text-3xl md:text-5xl font-bold max-w-2xl">
                        {title}
                    </h2>
                </div>

                <p className="text-base md:text-lg text-white/90 max-w-xl">
                    {description}
                </p>

                {action &&
                    <Button className="bg-white text-black hover:bg-white/90 rounded-full px-8" onClick={onClick}>
                        {action}
                    </Button>
                }
            </div>

        </div>
    )
}

export default TitleCard